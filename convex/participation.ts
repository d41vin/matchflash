import type { GenericDatabaseWriter } from "convex/server"
import { v } from "convex/values"

import { mutation, type MutationCtx } from "./_generated/server"
import { effectiveFixturePhase } from "./fixture_phase"
import { isLiveFixturePhase } from "./participation_rules"
import type { MatchFlashDataModel } from "./schema"
import { ACTIVITY_THROTTLE_MS, applyActivityContribution } from "../lib/heat"

const REACTION_COLORS = ["cyan", "violet", "amber", "rose"]

function profileForWallet(walletAddress: string) {
  const suffix = walletAddress.slice(-4)
  const colorIndex =
    walletAddress
      .split("")
      .reduce((sum, character) => sum + character.charCodeAt(0), 0) %
    REACTION_COLORS.length

  return {
    displayName: `Fan ${suffix}`,
    avatarColor: REACTION_COLORS[colorIndex],
  }
}

function database(
  ctx: MutationCtx
): GenericDatabaseWriter<MatchFlashDataModel> {
  // Generated Convex bindings are refreshed when the deployment is next
  // generated. Keep this boundary typed against the local schema meanwhile.
  return ctx.db as unknown as GenericDatabaseWriter<MatchFlashDataModel>
}

async function applyFixtureActivityHeat(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  fixtureId: number,
  now: number
) {
  const state = await db
    .query("matchStates")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", fixtureId))
    .unique()
  if (!state) return

  if (
    state.lastActivityHeatUpdateAt !== undefined &&
    now - state.lastActivityHeatUpdateAt < ACTIVITY_THROTTLE_MS
  ) {
    return
  }

  const heatState = {
    heat: state.heat ?? 0,
    heatUpdatedAt: state.heatUpdatedAt ?? now,
  }

  const reactions = await db
    .query("liveReactions")
    .withIndex("by_fixtureId_and_createdAt", (query) =>
      query.eq("fixtureId", fixtureId)
    )
    .order("desc")
    .take(200)
  const recentCount = reactions.filter(
    (reaction) => now - reaction.createdAt <= 20_000
  ).length
  if (recentCount === 0) return

  await db.patch(state._id, {
    ...applyActivityContribution(heatState, recentCount, now),
    lastActivityHeatUpdateAt: now,
  })
}

async function currentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) {
    throw new Error("Sign in to react live.")
  }

  const db = database(ctx)
  const existing = await db
    .query("users")
    .withIndex("by_tokenIdentifier", (query) =>
      query.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique()

  if (existing) {
    return existing
  }

  const profile = profileForWallet(identity.subject)
  const userId = await db.insert("users", {
    authSubject: identity.subject,
    tokenIdentifier: identity.tokenIdentifier,
    walletAddress: identity.subject,
    ...profile,
    createdAt: Date.now(),
  })

  const user = await db.get(userId)
  if (!user) {
    throw new Error("Unable to create the signed-in user.")
  }

  return user
}

export const recordLiveReaction = mutation({
  args: {
    fixtureId: v.number(),
    reaction: v.union(
      v.literal("cheer"),
      v.literal("wow"),
      v.literal("nervous")
    ),
  },
  handler: async (ctx, args) => {
    const db = database(ctx)
    const state = await db
      .query("fixtureStates")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .unique()

    if (
      !isLiveFixturePhase(effectiveFixturePhase(args.fixtureId, state?.phase))
    ) {
      throw new Error("Live reactions are unavailable for this fixture.")
    }

    const user = await currentUser(ctx)
    if (!user) {
      throw new Error("Unable to resolve the signed-in user.")
    }

    const createdAt = Date.now()
    const reactionId = await db.insert("liveReactions", {
      fixtureId: args.fixtureId,
      userId: user._id,
      reaction: args.reaction,
      createdAt,
    })
    await applyFixtureActivityHeat(db, args.fixtureId, createdAt)

    const eligibility = await db
      .query("trophyEligibility")
      .withIndex("by_userId_and_fixtureId", (query) =>
        query.eq("userId", user._id).eq("fixtureId", args.fixtureId)
      )
      .unique()

    if (!eligibility) {
      await db.insert("trophyEligibility", {
        userId: user._id,
        fixtureId: args.fixtureId,
        eligibleAt: createdAt,
        claimStatus: "unclaimed",
      })
    }

    return { reactionId }
  },
})
