import type { GenericDatabaseWriter } from "convex/server"
import { v } from "convex/values"

import { isFinalStatus, sourceAction } from "../lib/flash-classification"
import {
  internalQuery,
  mutation,
  query,
  type MutationCtx,
} from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import { currentUser, requireActiveRoom } from "./rooms"
import type { MatchFlashDataModel } from "./schema"
import { effectiveFixturePhase } from "./fixture_phase"
import { isLiveFixturePhase } from "./participation_rules"
import { recordTrophyEligibility } from "./trophy_eligibility"

const LOCK_WINDOW_MS = 20_000
const NEXT_GOAL_OPTIONS = [
  { id: "participant1", label: "Participant 1" },
  { id: "participant2", label: "Participant 2" },
  { id: "noFurtherGoals", label: "No further goals" },
] as const
const PENALTY_OPTIONS = [
  { id: "scored", label: "Scored" },
  { id: "notScored", label: "Not scored" },
] as const

type Database = GenericDatabaseWriter<MatchFlashDataModel>
type PromptTemplate = "nextGoal" | "penaltyOutcome"
type PromptStatus = "open" | "locked" | "settled" | "voided"
type SourceEvent = {
  action: string
  actionId: number
  confirmed: boolean
  participant?: 1 | 2
  outcome?: "Scored" | "Missed" | "Retake"
  followsActionId?: number
  final: boolean
  manualCorrection: boolean
  correction: boolean
}

function database(ctx: MutationCtx): Database {
  return ctx.db as unknown as Database
}

function sourceEvent(raw: unknown): SourceEvent | null {
  const source = sourceAction(raw)
  if (!source) return null
  return {
    action: source.action,
    actionId: source.actionId,
    confirmed: source.confirmed,
    ...(source.participant !== undefined
      ? { participant: source.participant }
      : {}),
    ...(source.outcome === "Scored" ||
    source.outcome === "Missed" ||
    source.outcome === "Retake"
      ? { outcome: source.outcome }
      : {}),
    ...(source.followsActionId !== undefined
      ? { followsActionId: source.followsActionId }
      : {}),
    final:
      !source.amended &&
      source.action === "status" &&
      isFinalStatus(source.statusId),
    manualCorrection: source.manualCorrection,
    correction: source.amended,
  }
}

function promptIsActive(status: PromptStatus) {
  return status === "open" || status === "locked"
}

async function activePrompts(
  db: Database,
  fixtureId: number,
  template: PromptTemplate
) {
  const prompts = await db
    .query("predictionPrompts")
    .withIndex("by_fixtureId_and_template_and_status", (query) =>
      query.eq("fixtureId", fixtureId).eq("template", template)
    )
    .take(100)
  return prompts.filter((prompt) => promptIsActive(prompt.status))
}

async function ensurePrompt(
  db: Database,
  fixture: { fixtureId: number; participant1: string; participant2: string },
  flashCardId: Id<"flashCards">,
  sourceActionId: number,
  template: PromptTemplate,
  now: number
) {
  const existing = await db
    .query("predictionPrompts")
    .withIndex("by_flashCardId", (query) =>
      query.eq("flashCardId", flashCardId)
    )
    .unique()
  if (existing) return existing._id

  const isNextGoal = template === "nextGoal"
  return await db.insert("predictionPrompts", {
    fixtureId: fixture.fixtureId,
    flashCardId,
    sourceActionId,
    template,
    ruleKey: isNextGoal
      ? "nextGoal.confirmedGoalOrFullTime.v1"
      : "penaltyOutcome.confirmedOutcome.v1",
    lockRuleKey: "fixedWindow.v1",
    voidRuleKey: "voidOnAffectingCorrection.v1",
    question: isNextGoal ? "Who scores next?" : "What is the penalty outcome?",
    options: isNextGoal
      ? [
          { id: "participant1", label: fixture.participant1 },
          { id: "participant2", label: fixture.participant2 },
          NEXT_GOAL_OPTIONS[2],
        ]
      : [...PENALTY_OPTIONS],
    opensAt: now,
    locksAt: now + LOCK_WINDOW_MS,
    settlementRule: isNextGoal
      ? "Settles at the next confirmed active goal or full time."
      : "Settles as scored or not scored; a retake stays open.",
    settlementMethod: "pipeline",
    status: "open",
  })
}

async function settlePrompt(
  db: Database,
  promptId: Id<"predictionPrompts">,
  winningOption: string,
  actionId: number,
  now: number
) {
  const prompt = await db.get("predictionPrompts", promptId)
  if (!prompt || !promptIsActive(prompt.status)) return
  const predictions = await db
    .query("predictions")
    .withIndex("by_promptId", (query) => query.eq("promptId", promptId))
    .take(500)
  for (const prediction of predictions) {
    const pointsAwarded = prediction.optionId === winningOption ? 1 : 0
    await db.patch(prediction._id, {
      result: pointsAwarded === 1 ? "win" : "loss",
      pointsAwarded,
    })
    if (pointsAwarded === 0) continue
    const membership = await db
      .query("roomMembers")
      .withIndex("by_roomId_and_userId", (query) =>
        query.eq("roomId", prediction.roomId).eq("userId", prediction.userId)
      )
      .unique()
    if (membership)
      await db.patch(membership._id, { score: membership.score + 1 })
  }
  await db.patch(promptId, {
    status: "settled",
    winningOption,
    settledByActionId: actionId,
    settledAt: now,
  })
}

async function voidPrompt(
  db: Database,
  promptId: Id<"predictionPrompts">,
  now: number,
  message: string
) {
  const prompt = await db.get("predictionPrompts", promptId)
  if (!prompt || prompt.status === "voided") return
  const predictions = await db
    .query("predictions")
    .withIndex("by_promptId", (query) => query.eq("promptId", promptId))
    .take(500)
  for (const prediction of predictions) {
    if (prediction.pointsAwarded === 1) {
      const membership = await db
        .query("roomMembers")
        .withIndex("by_roomId_and_userId", (query) =>
          query.eq("roomId", prediction.roomId).eq("userId", prediction.userId)
        )
        .unique()
      if (membership)
        await db.patch(membership._id, {
          score: Math.max(0, membership.score - 1),
        })
    }
    await db.patch(prediction._id, { result: "void", pointsAwarded: 0 })
  }
  await db.patch(promptId, { status: "voided", settledAt: now })
  await db.insert("predictionCorrectionNotes", {
    fixtureId: prompt.fixtureId,
    promptId,
    message,
    createdAt: now,
  })
}

export async function voidPredictionsForAction(
  db: Database,
  fixtureId: number,
  actionId: number,
  now: number
) {
  const prompts = await db
    .query("predictionPrompts")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", fixtureId))
    .take(500)
  for (const prompt of prompts) {
    if (
      prompt.sourceActionId === actionId ||
      prompt.settledByActionId === actionId
    ) {
      await voidPrompt(
        db,
        prompt._id,
        now,
        "A confirmed source correction affected this prediction, so it was voided."
      )
    }
  }
}

async function settledFixturePrompts(db: Database, fixtureId: number) {
  const prompts = await db
    .query("predictionPrompts")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", fixtureId))
    .take(500)
  return prompts.filter((prompt) => prompt.status === "settled")
}

async function queueManualReviews(
  db: Database,
  fixtureId: number,
  actionId: number | undefined,
  now: number,
  prompts: Awaited<ReturnType<typeof settledFixturePrompts>>
) {
  for (const prompt of prompts) {
    await db.insert("predictionCorrectionReviews", {
      fixtureId,
      promptId: prompt._id,
      ...(actionId !== undefined ? { sourceActionId: actionId } : {}),
      reason: "A late source correction needs manual review.",
      createdAt: now,
      status: "pending",
    })
  }
}

export async function queueManualReviewsForAction(
  db: Database,
  fixtureId: number,
  actionId: number,
  now: number
) {
  const prompts = (await settledFixturePrompts(db, fixtureId)).filter(
    (prompt) =>
      prompt.sourceActionId === actionId ||
      prompt.settledByActionId === actionId
  )
  await queueManualReviews(db, fixtureId, actionId, now, prompts)
}

export async function applyPredictionEvent(
  db: Database,
  fixtureId: number,
  raw: unknown,
  flashCardId: Id<"flashCards"> | undefined,
  now: number
) {
  const event = sourceEvent(raw)
  if (!event) return
  const fixture = await db
    .query("fixtures")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", fixtureId))
    .unique()
  if (!fixture) return
  if (event.manualCorrection) {
    await queueManualReviews(
      db,
      fixtureId,
      event.actionId,
      now,
      await settledFixturePrompts(db, fixtureId)
    )
    return
  }
  // A source amendment may preserve the card while changing some detail.
  // It must not re-settle the next prompt from the historical action.
  if (event.correction) return
  if (!event.confirmed) return

  if (event.action === "kickoff" && flashCardId) {
    await ensurePrompt(
      db,
      fixture,
      flashCardId,
      event.actionId,
      "nextGoal",
      now
    )
    return
  }
  if (event.action === "goal" && event.participant && flashCardId) {
    const winningOption =
      event.participant === 1 ? "participant1" : "participant2"
    for (const prompt of await activePrompts(db, fixtureId, "nextGoal")) {
      await settlePrompt(db, prompt._id, winningOption, event.actionId, now)
    }
    await ensurePrompt(
      db,
      fixture,
      flashCardId,
      event.actionId,
      "nextGoal",
      now
    )
    return
  }
  if (event.action === "penalty" && flashCardId) {
    await ensurePrompt(
      db,
      fixture,
      flashCardId,
      event.actionId,
      "penaltyOutcome",
      now
    )
    return
  }
  if (event.action === "penalty_outcome" && event.outcome !== "Retake") {
    const prompts = await activePrompts(db, fixtureId, "penaltyOutcome")
    const matching = event.followsActionId
      ? prompts.filter(
          (prompt) => prompt.sourceActionId === event.followsActionId
        )
      : prompts.length === 1
        ? prompts
        : []
    if (matching.length === 0) {
      await queueManualReviews(
        db,
        fixtureId,
        event.actionId,
        now,
        await settledFixturePrompts(db, fixtureId)
      )
      return
    }
    for (const prompt of matching) {
      await settlePrompt(
        db,
        prompt._id,
        event.outcome === "Scored" ? "scored" : "notScored",
        event.actionId,
        now
      )
    }
    return
  }
  if (event.final) {
    for (const prompt of await activePrompts(db, fixtureId, "nextGoal")) {
      await settlePrompt(db, prompt._id, "noFurtherGoals", event.actionId, now)
    }
  }
}

export const list = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    const now = Date.now()
    const prompts = await ctx.db
      .query("predictionPrompts")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .order("asc")
      .take(100)
    return prompts.map((prompt) => ({
      ...prompt,
      status:
        prompt.status === "open" && now >= prompt.locksAt
          ? ("locked" as const)
          : prompt.status,
    }))
  },
})

export const dataQualityNotes = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    const notes = await ctx.db
      .query("predictionCorrectionNotes")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .take(500)
    return notes
  },
})

export const pendingCorrectionReviews = internalQuery({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) =>
    await ctx.db
      .query("predictionCorrectionReviews")
      .withIndex("by_fixtureId_and_status", (query) =>
        query.eq("fixtureId", args.fixtureId).eq("status", "pending")
      )
      .take(500),
})

export const answer = mutation({
  args: {
    promptId: v.id("predictionPrompts"),
    roomId: v.id("rooms"),
    optionId: v.string(),
  },
  handler: async (ctx, args) => {
    const db = database(ctx)
    const room = await requireActiveRoom(db, args.roomId)
    const fixtureState = await db
      .query("fixtureStates")
      .withIndex("by_fixtureId", (query) => query.eq("fixtureId", room.fixtureId))
      .unique()
    if (
      !isLiveFixturePhase(
        effectiveFixturePhase(room.fixtureId, fixtureState?.phase)
      )
    ) {
      throw new Error("Predictions are available only while the fixture is live.")
    }
    const prompt = await db.get("predictionPrompts", args.promptId)
    if (!prompt || prompt.fixtureId !== room.fixtureId) {
      throw new Error("This prediction is not available in this Room.")
    }
    if (prompt.status !== "open" || Date.now() >= prompt.locksAt) {
      if (prompt.status === "open")
        await db.patch(prompt._id, { status: "locked" })
      throw new Error("This prediction is locked.")
    }
    if (!prompt.options.some((option) => option.id === args.optionId)) {
      throw new Error("Choose one of the listed prediction options.")
    }
    const user = await currentUser(ctx)
    const existing = await db
      .query("predictions")
      .withIndex("by_promptId_and_userId", (query) =>
        query.eq("promptId", prompt._id).eq("userId", user._id)
      )
      .unique()
    if (existing) throw new Error("You already answered this prediction.")

    const membership = await db
      .query("roomMembers")
      .withIndex("by_roomId_and_userId", (query) =>
        query.eq("roomId", room._id).eq("userId", user._id)
      )
      .unique()
    if (!membership && room.kind !== "global") {
      throw new Error("Join this Room before answering a prediction.")
    }
    if (!membership) {
      await db.insert("roomMembers", {
        roomId: room._id,
        fixtureId: room.fixtureId,
        userId: user._id,
        joinedAt: Date.now(),
        score: 0,
      })
    }
    const createdAt = Date.now()
    const predictionId = await db.insert("predictions", {
      promptId: prompt._id,
      roomId: room._id,
      userId: user._id,
      optionId: args.optionId,
      createdAt,
    })
    await recordTrophyEligibility(db, user._id, room.fixtureId, createdAt)
    return { predictionId }
  },
})
