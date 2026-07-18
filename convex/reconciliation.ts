import type { GenericDatabaseWriter } from "convex/server"

import {
  reconcileFixtureEvent,
  type FixtureAction,
  type ReconciledFixture,
} from "../lib/fixture-reconciliation"
import {
  amendedActionId,
  classifyCoreFlashCard,
  discardedActionId,
} from "../lib/flash-classification"
import {
  applyPossessionContribution,
  shouldApplyPossessionContribution,
} from "../lib/heat"
import { applyFlashHeat } from "./heat"
import type { MatchFlashDataModel } from "./schema"
import type { Id } from "./_generated/dataModel"

type ReconciliationDatabase = GenericDatabaseWriter<MatchFlashDataModel>

function updatePayload(raw: unknown): unknown {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null
  }

  const update = (raw as Record<string, unknown>).Update
  if (typeof update !== "object" || update === null || Array.isArray(update)) {
    return null
  }

  const data = (update as Record<string, unknown>).Data
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return null
  }

  const action = (update as Record<string, unknown>).Action
  if (action === "action_amend") {
    return (data as Record<string, unknown>).New ?? null
  }

  return data
}

async function writeAction(
  db: ReconciliationDatabase,
  action: FixtureAction,
  raw: unknown,
  capturedAt: number
) {
  const existing = await db
    .query("fixtureActions")
    .withIndex("by_fixtureId_and_actionId", (query) =>
      query.eq("fixtureId", action.fixtureId).eq("actionId", action.actionId)
    )
    .unique()

  if (
    existing?.sequence !== undefined &&
    action.sequence !== undefined &&
    action.sequence < existing.sequence
  ) {
    return
  }

  const payload = updatePayload(raw)
  const record = {
    fixtureId: action.fixtureId,
    actionId: action.actionId,
    // A discard identifies a prior action; preserve that action's type when
    // it is already known instead of overwriting it with "action_discarded".
    action: action.discarded && existing ? existing.action : action.action,
    ...(action.sequence !== undefined ? { sequence: action.sequence } : {}),
    discarded: action.discarded,
    payload: action.discarded && existing ? existing.payload : payload,
    updatedAt: capturedAt,
  }

  if (existing) {
    await db.replace(existing._id, record)
  } else {
    await db.insert("fixtureActions", record)
  }
}

/** Applies a stored score message to the worker-owned fixture read model. */
export async function reconcileCapturedScoreEvent(
  db: ReconciliationDatabase,
  raw: unknown,
  capturedAt: number
) {
  let fixtureId: number | undefined
  if (typeof raw === "object" && raw !== null && !Array.isArray(raw)) {
    const envelope = raw as Record<string, unknown>
    const update = envelope.Update
    const fixtureInfo = envelope.FixtureInfo
    if (
      typeof update === "object" &&
      update !== null &&
      !Array.isArray(update)
    ) {
      fixtureId = (update as Record<string, unknown>).FixtureId as
        number | undefined
    }
    if (
      fixtureId === undefined &&
      typeof fixtureInfo === "object" &&
      fixtureInfo !== null &&
      !Array.isArray(fixtureInfo)
    ) {
      fixtureId = (fixtureInfo as Record<string, unknown>).FixtureId as
        number | undefined
    }
  }

  const existingState =
    fixtureId === undefined
      ? undefined
      : await db
          .query("matchStates")
          .withIndex("by_fixtureId", (query) =>
            query.eq("fixtureId", fixtureId!)
          )
          .unique()
  const existingFixture =
    fixtureId === undefined
      ? undefined
      : await db
          .query("fixtures")
          .withIndex("by_fixtureId", (query) =>
            query.eq("fixtureId", fixtureId!)
          )
          .unique()

  const reconciled = reconcileFixtureEvent(
    existingState
      ? {
          fixture: existingFixture
            ? {
                fixtureId: existingFixture.fixtureId,
                competition: existingFixture.competition,
                stage: existingFixture.stage,
                participant1: existingFixture.participant1,
                participant2: existingFixture.participant2,
                startsAt: existingFixture.startsAt,
              }
            : undefined,
          state: existingState,
        }
      : undefined,
    raw,
    capturedAt
  )
  if (!reconciled) {
    return
  }

  await persistReconciledFixture(
    db,
    reconciled,
    existingFixture ?? undefined,
    existingState ?? undefined,
    raw,
    capturedAt
  )
  await updateFlashTimeline(db, raw, reconciled, capturedAt)
  await updatePossessionHeat(db, reconciled, capturedAt)
}

async function updatePossessionHeat(
  db: ReconciliationDatabase,
  reconciled: ReconciledFixture,
  capturedAt: number
) {
  const possession = reconciled.state.possession
  if (possession?.since !== capturedAt) return

  const state = await db
    .query("matchStates")
    .withIndex("by_fixtureId", (query) =>
      query.eq("fixtureId", reconciled.state.fixtureId)
    )
    .unique()
  if (!state) return

  if (
    possession.intensity !== "danger" &&
    possession.intensity !== "highDanger"
  ) {
    if ((state.pendingPossessionTicks ?? 0) > 0) {
      await db.patch(state._id, { pendingPossessionTicks: 0 })
    }
    return
  }

  const lastUpdateAt = state.lastPossessionHeatUpdateAt
  if (
    lastUpdateAt === undefined ||
    shouldApplyPossessionContribution(lastUpdateAt, capturedAt)
  ) {
    const heat = applyPossessionContribution(
      {
        heat: state.heat ?? 0,
        heatUpdatedAt: state.heatUpdatedAt ?? capturedAt,
      },
      (state.pendingPossessionTicks ?? 0) + 1,
      capturedAt
    )
    await db.patch(state._id, {
      ...heat,
      lastPossessionHeatUpdateAt: capturedAt,
      pendingPossessionTicks: 0,
    })
    return
  }

  await db.patch(state._id, {
    pendingPossessionTicks: (state.pendingPossessionTicks ?? 0) + 1,
  })
}

async function updateFlashTimeline(
  db: ReconciliationDatabase,
  raw: unknown,
  reconciled: ReconciledFixture,
  capturedAt: number
) {
  // A correction is allowed to change its targeted action only when it is at
  // least as recent as the correction already reconciled for that action.
  // This prevents a late replayed discard from retracting newer state.
  if (reconciled.action?.sequence !== undefined) {
    const existingAction = await db
      .query("fixtureActions")
      .withIndex("by_fixtureId_and_actionId", (query) =>
        query
          .eq("fixtureId", reconciled.action!.fixtureId)
          .eq("actionId", reconciled.action!.actionId)
      )
      .unique()
    if (
      existingAction?.sequence !== undefined &&
      reconciled.action.sequence < existingAction.sequence
    ) {
      return
    }
  }

  const discardedId = discardedActionId(raw)
  if (discardedId !== null) {
    const existing = await db
      .query("flashCards")
      .withIndex("by_fixtureId_and_actionId", (query) =>
        query
          .eq("fixtureId", reconciled.state.fixtureId)
          .eq("actionId", discardedId)
      )
      .unique()
    if (existing && !existing.retracted) {
      await db.patch(existing._id, { retracted: true, updatedAt: capturedAt })
    }
    return
  }

  const classified = classifyCoreFlashCard(
    reconciled.state.fixtureId,
    raw,
    reconciled.state.reliability
  )
  if (!classified) {
    const amendedId = amendedActionId(raw)
    if (amendedId === null) return

    // Reliability gates prevent new cards but do not erase a previously
    // confirmed record. A real source declassification, however, retracts
    // the affected card from the public timeline.
    const remainsCore = classifyCoreFlashCard(
      reconciled.state.fixtureId,
      raw,
      reconciled.state.reliability,
      true
    )
    if (remainsCore) return

    const existing = await db
      .query("flashCards")
      .withIndex("by_fixtureId_and_actionId", (query) =>
        query
          .eq("fixtureId", reconciled.state.fixtureId)
          .eq("actionId", amendedId)
      )
      .unique()
    if (existing && !existing.retracted) {
      await db.patch(existing._id, { retracted: true, updatedAt: capturedAt })
    }
    return
  }

  const existing = await db
    .query("flashCards")
    .withIndex("by_fixtureId_and_actionId", (query) =>
      query
        .eq("fixtureId", classified.fixtureId)
        .eq("actionId", classified.actionId)
    )
    .unique()
  if (existing) {
    await db.patch(existing._id, {
      type: classified.type,
      title: classified.title,
      retracted: false,
      updatedAt: capturedAt,
    })
    return
  }

  await db.insert("flashCards", {
    ...classified,
    confirmed: true,
    retracted: false,
    createdAt: capturedAt,
    updatedAt: capturedAt,
  })
  await applyFlashHeat(
    db,
    classified.fixtureId,
    classified.impactScore,
    capturedAt
  )
}

async function persistReconciledFixture(
  db: ReconciliationDatabase,
  reconciled: ReconciledFixture,
  existingFixture: { _id: Id<"fixtures"> } | undefined,
  existingState: { _id: Id<"matchStates"> } | undefined,
  raw: unknown,
  capturedAt: number
) {
  if (reconciled.fixture) {
    const fixture = {
      ...reconciled.fixture,
      sport: "soccer" as const,
      lastTxlineTs: reconciled.state.updatedAt,
    }
    if (existingFixture) {
      await db.replace(existingFixture._id, fixture)
    } else {
      await db.insert("fixtures", fixture)
    }
  }

  if (existingState) {
    await db.replace(existingState._id, reconciled.state)
  } else {
    await db.insert("matchStates", reconciled.state)
  }

  const participationState = await db
    .query("fixtureStates")
    .withIndex("by_fixtureId", (query) =>
      query.eq("fixtureId", reconciled.state.fixtureId)
    )
    .unique()
  const phaseRecord = {
    fixtureId: reconciled.state.fixtureId,
    phase: reconciled.state.phase,
    updatedAt: capturedAt,
  }
  if (participationState) {
    await db.replace(participationState._id, phaseRecord)
  } else {
    await db.insert("fixtureStates", phaseRecord)
  }

  if (reconciled.action) {
    await writeAction(db, reconciled.action, raw, capturedAt)
  }
}
