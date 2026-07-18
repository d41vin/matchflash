import type {
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server"
import { v } from "convex/values"

import {
  matchesConfirmedStablePriceRow,
  normalizeStablePriceOdds,
  observedOddsTaxonomy,
  taxonomyKey,
  type StablePriceOdds,
} from "../lib/stable-price"
import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import { applyFlashHeat } from "./heat"
import type { MatchFlashDataModel } from "./schema"

type OddsDatabase = GenericDatabaseWriter<MatchFlashDataModel>

function reader(ctx: QueryCtx): GenericDatabaseReader<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseReader<MatchFlashDataModel>
}

function writer(ctx: MutationCtx): OddsDatabase {
  return ctx.db as unknown as OddsDatabase
}

async function confirmedStablePriceRow(db: OddsDatabase) {
  return await db
    .query("oddsCanonicalRows")
    .withIndex("by_key", (query) => query.eq("key", "stablePrice"))
    .unique()
}

/** Gives an operator the exact market/bookmaker tuples observed per fixture. */
export const listTaxonomy = internalQuery({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    return await reader(ctx)
      .query("oddsTaxonomies")
      .withIndex("by_fixtureId_and_taxonomyKey", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .order("asc")
      .take(100)
  },
})

/**
 * An operator confirms one empirical row after inspecting discovery output.
 * The mutation is internal so browsers cannot nominate a bookmaker or market.
 */
export const confirmStablePriceRow = internalMutation({
  args: { taxonomyId: v.id("oddsTaxonomies") },
  handler: async (ctx, args) => {
    const db = writer(ctx)
    const taxonomy = await db.get(args.taxonomyId)
    if (!taxonomy) {
      throw new Error("The observed odds taxonomy no longer exists.")
    }

    const row = {
      key: "stablePrice" as const,
      taxonomyId: taxonomy._id,
      taxonomyKey: taxonomy.taxonomyKey,
      bookmaker: taxonomy.bookmaker,
      bookmakerId: taxonomy.bookmakerId,
      superOddsType: taxonomy.superOddsType,
      ...(taxonomy.marketPeriod ? { marketPeriod: taxonomy.marketPeriod } : {}),
      confirmedAt: Date.now(),
    }
    const existing = await confirmedStablePriceRow(db)
    if (existing) {
      await db.replace(existing._id, row)
    } else {
      await db.insert("oddsCanonicalRows", row)
    }
    return null
  },
})

async function recordTaxonomy(
  db: OddsDatabase,
  raw: unknown,
  sourceEventId: string,
  observedAt: number
) {
  const taxonomy = observedOddsTaxonomy(raw)
  if (!taxonomy) return null

  const key = taxonomyKey(taxonomy)
  const existing = await db
    .query("oddsTaxonomies")
    .withIndex("by_fixtureId_and_taxonomyKey", (query) =>
      query.eq("fixtureId", taxonomy.fixtureId).eq("taxonomyKey", key)
    )
    .unique()
  if (existing) {
    await db.patch(existing._id, {
      lastInRunning: taxonomy.inRunning,
      lastObservedAt: observedAt,
      lastSourceEventId: sourceEventId,
      sampleCount: existing.sampleCount + 1,
    })
    return existing._id
  }

  return await db.insert("oddsTaxonomies", {
    fixtureId: taxonomy.fixtureId,
    taxonomyKey: key,
    bookmaker: taxonomy.bookmaker,
    bookmakerId: taxonomy.bookmakerId,
    superOddsType: taxonomy.superOddsType,
    ...(taxonomy.marketPeriod ? { marketPeriod: taxonomy.marketPeriod } : {}),
    lastInRunning: taxonomy.inRunning,
    firstObservedAt: observedAt,
    lastObservedAt: observedAt,
    lastSourceEventId: sourceEventId,
    sampleCount: 1,
  })
}

type ProbabilityOutcome = "home" | "draw" | "away"

function largestProbabilityChange(
  previous: Pick<StablePriceOdds, "home" | "draw" | "away">,
  next: Pick<StablePriceOdds, "home" | "draw" | "away">
) {
  const candidates: Array<{
    outcome: ProbabilityOutcome
    before: number
    after: number
  }> = [
    { outcome: "home", before: previous.home, after: next.home },
    { outcome: "draw", before: previous.draw, after: next.draw },
    { outcome: "away", before: previous.away, after: next.away },
  ]
  return candidates.reduce((largest, candidate) =>
    Math.abs(candidate.after - candidate.before) >
    Math.abs(largest.after - largest.before)
      ? candidate
      : largest
  )
}

function oddsSwingImpact(delta: number) {
  const magnitude = Math.abs(delta)
  if (magnitude > 20) return 50
  if (magnitude > 10) return 30
  return 0
}

async function createOddsSwingFlash(
  db: OddsDatabase,
  fixtureId: number,
  sourceEventId: string,
  previous: Pick<StablePriceOdds, "home" | "draw" | "away">,
  next: StablePriceOdds,
  oddsTaxonomyKey: string,
  capturedAt: number
) {
  const movement = largestProbabilityChange(previous, next)
  const impactScore = oddsSwingImpact(movement.after - movement.before)
  if (impactScore === 0) return

  const fixture = await db
    .query("fixtures")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", fixtureId))
    .unique()
  if (!fixture) return

  const actionId = `odds:${sourceEventId}`
  const existing = await db
    .query("flashCards")
    .withIndex("by_fixtureId_and_actionId", (query) =>
      query.eq("fixtureId", fixtureId).eq("actionId", actionId)
    )
    .unique()
  if (existing) return

  const label =
    movement.outcome === "home"
      ? `${fixture.participant1} win probability`
      : movement.outcome === "away"
        ? `${fixture.participant2} win probability`
        : "Draw probability"
  const direction = movement.after > movement.before ? "rose" : "fell"
  await db.insert("flashCards", {
    fixtureId,
    actionId,
    type: "oddsSwing",
    title: `${label} ${direction} from ${movement.before}% to ${movement.after}%.`,
    probBefore: movement.before,
    probAfter: movement.after,
    oddsTaxonomyKey,
    impactScore,
    confirmed: true,
    retracted: false,
    createdAt: capturedAt,
    updatedAt: capturedAt,
  })
  await applyFlashHeat(db, fixtureId, impactScore, capturedAt)
}

/** Applies only a manually-confirmed StablePrice row to the safe read model. */
export async function reconcileCapturedOddsEvent(
  db: OddsDatabase,
  raw: unknown,
  sourceEventId: string,
  capturedAt: number
) {
  await recordTaxonomy(db, raw, sourceEventId, capturedAt)

  const odds = normalizeStablePriceOdds(raw)
  if (!odds) return
  const confirmed = await confirmedStablePriceRow(db)
  if (!confirmed || !matchesConfirmedStablePriceRow(odds, confirmed)) return

  const state = await db
    .query("matchStates")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", odds.fixtureId))
    .unique()
  if (!state) return
  if (state.oddsProvenance && odds.asOfTs < state.oddsProvenance.asOfTs) return

  const previous =
    state.oddsProvenance &&
    state.oddsProvenance.bookmaker === confirmed.bookmaker &&
    state.oddsProvenance.bookmakerId === confirmed.bookmakerId &&
    state.oddsProvenance.superOddsType === confirmed.superOddsType &&
    state.oddsProvenance.marketPeriod === confirmed.marketPeriod &&
    state.winProb1 !== undefined &&
    state.drawProb !== undefined &&
    state.winProb2 !== undefined
      ? { home: state.winProb1, draw: state.drawProb, away: state.winProb2 }
      : null
  await db.patch(state._id, {
    winProb1: odds.home,
    drawProb: odds.draw,
    winProb2: odds.away,
    oddsProvenance: {
      bookmaker: odds.bookmaker,
      bookmakerId: odds.bookmakerId,
      superOddsType: odds.superOddsType,
      ...(odds.marketPeriod ? { marketPeriod: odds.marketPeriod } : {}),
      asOfTs: odds.asOfTs,
    },
  })

  if (previous) {
    await createOddsSwingFlash(
      db,
      odds.fixtureId,
      sourceEventId,
      previous,
      odds,
      confirmed.taxonomyKey,
      capturedAt
    )
  }
}
