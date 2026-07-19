import type { GenericDatabaseReader } from "convex/server"
import { v } from "convex/values"

import { query, type QueryCtx } from "./_generated/server"
import { reliabilityWasFlagged } from "./reliability"
import type { MatchFlashDataModel } from "./schema"

function reader(ctx: QueryCtx): GenericDatabaseReader<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseReader<MatchFlashDataModel>
}

async function authenticatedUser(
  ctx: QueryCtx,
  db: GenericDatabaseReader<MatchFlashDataModel>
) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) return null
  return await db
    .query("users")
    .withIndex("by_tokenIdentifier", (query) =>
      query.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique()
}

export const get = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const [fixture, state] = await Promise.all([
      db
        .query("fixtures")
        .withIndex("by_fixtureId", (query) =>
          query.eq("fixtureId", args.fixtureId)
        )
        .unique(),
      db
        .query("matchStates")
        .withIndex("by_fixtureId", (query) =>
          query.eq("fixtureId", args.fixtureId)
        )
        .unique(),
    ])
    if (!fixture || !state || state.phase !== "final") return null

    const [cards, correctionNotes] = await Promise.all([
      db
        .query("flashCards")
        .withIndex("by_fixtureId_and_retracted", (query) =>
          query.eq("fixtureId", args.fixtureId).eq("retracted", false)
        )
        .order("desc")
        .take(500),
      db
        .query("predictionCorrectionNotes")
        .withIndex("by_fixtureId", (query) =>
          query.eq("fixtureId", args.fixtureId)
        )
        .order("asc")
        .take(100),
    ])
    const biggestSwing = cards
      .filter(
        (card) => card.probBefore !== undefined && card.probAfter !== undefined
      )
      .sort(
        (left, right) =>
          Math.abs((right.probAfter ?? 0) - (right.probBefore ?? 0)) -
          Math.abs((left.probAfter ?? 0) - (left.probBefore ?? 0))
      )[0]
    const dataQualityNotes = [
      ...new Set([
        ...((state.hadReliabilityIssue ??
        reliabilityWasFlagged(state.reliability))
          ? ["Some match data was flagged as unreliable during play."]
          : []),
        ...correctionNotes.map((note) => note.message),
      ]),
    ]

    const shared = {
      fixtureId: fixture.fixtureId,
      competition: fixture.competition,
      stage: fixture.stage,
      participant1: fixture.participant1,
      participant2: fixture.participant2,
      startsAt: fixture.startsAt,
      score1: state.score1,
      score2: state.score2,
      headline: `${fixture.participant1} ${state.score1}\u2013${state.score2} ${fixture.participant2}`,
      biggestSwing: biggestSwing
        ? {
            title: biggestSwing.title,
            change: Math.abs(
              biggestSwing.probAfter! - biggestSwing.probBefore!
            ),
          }
        : null,
      peakHeat: state.peakHeat ?? state.heat ?? null,
      peakHeatUpdatedAt: state.peakHeatUpdatedAt ?? state.heatUpdatedAt ?? null,
      dataQualityNotes,
    }

    const user = await authenticatedUser(ctx, db)
    if (!user) return { shared, participant: null }
    const eligibility = await db
      .query("trophyEligibility")
      .withIndex("by_userId_and_fixtureId", (query) =>
        query.eq("userId", user._id).eq("fixtureId", args.fixtureId)
      )
      .unique()
    if (!eligibility) return { shared, participant: null }

    const claim = await db
      .query("trophyClaims")
      .withIndex("by_userId_and_fixtureId", (query) =>
        query.eq("userId", user._id).eq("fixtureId", args.fixtureId)
      )
      .unique()

    const predictions = []
    for (const prediction of await db
      .query("predictions")
      .withIndex("by_userId", (query) => query.eq("userId", user._id))
      .order("desc")
      .take(500)) {
      const prompt = await db.get("predictionPrompts", prediction.promptId)
      if (prompt?.fixtureId !== args.fixtureId) continue
      const option = prompt.options.find(
        (entry) => entry.id === prediction.optionId
      )
      predictions.push({
        promptId: prompt._id,
        question: prompt.question,
        optionLabel: option?.label ?? prediction.optionId,
        result: prediction.result,
        pointsAwarded: prediction.pointsAwarded ?? 0,
      })
    }

    const memberships = await db
      .query("roomMembers")
      .withIndex("by_fixtureId_and_userId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .take(500)
    const scores = new Map<string, number>()
    for (const membership of memberships) {
      scores.set(
        membership.userId,
        (scores.get(membership.userId) ?? 0) + membership.score
      )
    }
    const orderedScores = [...scores.entries()].sort(
      ([leftId, leftScore], [rightId, rightScore]) =>
        rightScore - leftScore || leftId.localeCompare(rightId)
    )
    const rank = orderedScores.findIndex(([userId]) => userId === user._id) + 1

    return {
      shared,
      participant: {
        eligibility: {
          eligibleAt: eligibility.eligibleAt,
          claimStatus: eligibility.claimStatus,
        },
        trophy: claim
          ? {
              status: claim.status,
              mintAddress: claim.mintAddress ?? null,
              failureMessage: claim.failureMessage ?? null,
            }
          : null,
        predictions,
        matchStanding:
          rank > 0
            ? {
                score: scores.get(user._id) ?? 0,
                rank,
                participantCount: orderedScores.length,
              }
            : null,
      },
    }
  },
})

export const history = query({
  args: {},
  handler: async (ctx) => {
    const db = reader(ctx)
    const user = await authenticatedUser(ctx, db)
    if (!user) return []

    const eligibility = await db
      .query("trophyEligibility")
      .withIndex("by_userId_and_fixtureId", (query) =>
        query.eq("userId", user._id)
      )
      .order("desc")
      .take(100)
    const history = []
    for (const record of eligibility) {
      const [fixture, state] = await Promise.all([
        db
          .query("fixtures")
          .withIndex("by_fixtureId", (query) =>
            query.eq("fixtureId", record.fixtureId)
          )
          .unique(),
        db
          .query("matchStates")
          .withIndex("by_fixtureId", (query) =>
            query.eq("fixtureId", record.fixtureId)
          )
          .unique(),
      ])
      if (!fixture || !state || state.phase !== "final") continue
      history.push({
        fixtureId: fixture.fixtureId,
        participant1: fixture.participant1,
        participant2: fixture.participant2,
        competition: fixture.competition,
        startsAt: fixture.startsAt,
        score1: state.score1,
        score2: state.score2,
        eligibleAt: record.eligibleAt,
        href: `/match/${fixture.fixtureId}`,
      })
    }
    return history
  },
})
