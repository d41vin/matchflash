/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { expect, test } from "vitest"

import { api, internal } from "./_generated/api"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")

const requestClaim = api.trophies.requestClaim
const recordLiveReaction = api.participation.recordLiveReaction

const fixtureInfo = {
  FixtureId: 42,
  Competition: "World Cup 2026",
  FixtureGroup: "World Cup > Final",
  Participant1: "Northshore",
  Participant2: "Southport",
  StartTime: "2026-07-19T19:00:00.000Z",
}

const fanIdentity = {
  subject: "TrophyFan111111111111111111111111111111111111",
  tokenIdentifier: "customJwt|TrophyFan111111111111111111111111111111111111",
}

async function capture(
  t: ReturnType<typeof convexTest>,
  sourceEventId: string,
  action: string,
  id: number,
  statusId: number
) {
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId,
    fixtureId: 42,
    eventType: action,
    raw: {
      FixtureInfo: fixtureInfo,
      Update: { Action: action, Id: id, Seq: id, StatusId: statusId },
    },
  })
}

async function activeDevnetTree(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await ctx.db.insert("merkleTrees", {
      treeAddress: "DevnetTree11111111111111111111111111111111111",
      collectionAddress: "DevnetCollection11111111111111111111111111111",
      capacity: 32,
      mintedCount: 0,
      isActive: true,
      createdAt: 1,
    })
  })
}

test("a qualifying participant reserves one Devnet trophy atomically", async () => {
  const t = convexTest(schema, modules)
  await activeDevnetTree(t)
  await capture(t, "live", "kickoff", 1, 4)
  const fan = t.withIdentity(fanIdentity)
  await fan.mutation(recordLiveReaction, {
    fixtureId: 42,
    reaction: "cheer",
  })
  await capture(t, "final", "status", 2, 5)

  await expect(fan.mutation(requestClaim, { fixtureId: 42 })).resolves.toEqual({
    status: "minting",
  })
  await expect(fan.mutation(requestClaim, { fixtureId: 42 })).rejects.toThrow(
    "already"
  )

  await expect(
    t.run(async (ctx) => {
      const [tree, eligibility, claim] = await Promise.all([
        ctx.db.query("merkleTrees").first(),
        ctx.db.query("trophyEligibility").first(),
        ctx.db.query("trophyClaims").first(),
      ])
      return { tree, eligibility, claim }
    })
  ).resolves.toMatchObject({
    tree: { mintedCount: 1 },
    eligibility: { claimStatus: "minting" },
    claim: { status: "minting", fixtureId: 42, leafIndex: 0 },
  })
})

test("replay-only and non-participating fans cannot reserve a trophy", async () => {
  const t = convexTest(schema, modules)
  await activeDevnetTree(t)
  await capture(t, "replay", "standby", 1, 3)
  await capture(t, "final", "status", 2, 5)
  await t.run(async (ctx) => {
    await ctx.db.insert("users", {
      authSubject: fanIdentity.subject,
      tokenIdentifier: fanIdentity.tokenIdentifier,
      walletAddress: fanIdentity.subject,
      displayName: "Fan 1111",
      avatarColor: "cyan",
      createdAt: 1,
    })
  })
  const fan = t.withIdentity(fanIdentity)

  await expect(fan.mutation(requestClaim, { fixtureId: 42 })).rejects.toThrow(
    "live participation"
  )
})

test("a pre-mint failure can be explicitly retried without reserving another leaf", async () => {
  const t = convexTest(schema, modules)
  await activeDevnetTree(t)
  await capture(t, "live", "kickoff", 1, 4)
  const fan = t.withIdentity(fanIdentity)
  await fan.mutation(recordLiveReaction, { fixtureId: 42, reaction: "cheer" })
  await capture(t, "final", "status", 2, 5)
  await fan.mutation(requestClaim, { fixtureId: 42 })

  await t.run(async (ctx) => {
    const [claim, eligibility] = await Promise.all([
      ctx.db.query("trophyClaims").first(),
      ctx.db.query("trophyEligibility").first(),
    ])
    if (!claim || !eligibility)
      throw new Error("Expected a reserved trophy claim.")
    await ctx.db.patch(claim._id, { status: "failed" })
    await ctx.db.patch(eligibility._id, { claimStatus: "failed" })
  })

  await expect(fan.mutation(requestClaim, { fixtureId: 42 })).resolves.toEqual({
    status: "minting",
  })
  await expect(
    t.run(async (ctx) => {
      const [tree, claim] = await Promise.all([
        ctx.db.query("merkleTrees").first(),
        ctx.db.query("trophyClaims").first(),
      ])
      return { tree, claim }
    })
  ).resolves.toMatchObject({
    tree: { mintedCount: 1 },
    claim: { status: "minting", leafIndex: 0 },
  })
})

test("a minted trophy is reported as claimed while its soulbound lock retries", async () => {
  const t = convexTest(schema, modules)
  await activeDevnetTree(t)
  await capture(t, "live", "kickoff", 1, 4)
  const fan = t.withIdentity(fanIdentity)
  await fan.mutation(recordLiveReaction, { fixtureId: 42, reaction: "cheer" })
  await capture(t, "final", "status", 2, 5)
  await fan.mutation(requestClaim, { fixtureId: 42 })

  await t.run(async (ctx) => {
    const [claim, eligibility] = await Promise.all([
      ctx.db.query("trophyClaims").first(),
      ctx.db.query("trophyEligibility").first(),
    ])
    if (!claim || !eligibility) throw new Error("Expected a reserved trophy claim.")
    await ctx.db.patch(claim._id, {
      status: "claimed",
      soulboundStatus: "failed",
      mintAddress: "DevnetTrophy111111111111111111111111111111111",
    })
    await ctx.db.patch(eligibility._id, { claimStatus: "claimed" })
  })

  await expect(fan.mutation(requestClaim, { fixtureId: 42 })).resolves.toEqual({
    status: "claimed",
  })
  await expect(
    t.run(async (ctx) => {
      const [tree, claim] = await Promise.all([
        ctx.db.query("merkleTrees").first(),
        ctx.db.query("trophyClaims").first(),
      ])
      return { tree, claim }
    })
  ).resolves.toMatchObject({
    tree: { mintedCount: 1 },
    claim: { status: "claimed", soulboundStatus: "failed", leafIndex: 0 },
  })
})

test("a claimed trophy retries its background soulbound lock without changing claim state", async () => {
  const t = convexTest(schema, modules)
  await activeDevnetTree(t)
  await capture(t, "live", "kickoff", 1, 4)
  const fan = t.withIdentity(fanIdentity)
  await fan.mutation(recordLiveReaction, { fixtureId: 42, reaction: "cheer" })
  await capture(t, "final", "status", 2, 5)
  await fan.mutation(requestClaim, { fixtureId: 42 })

  await t.run(async (ctx) => {
    const [claim, eligibility] = await Promise.all([
      ctx.db.query("trophyClaims").first(),
      ctx.db.query("trophyEligibility").first(),
    ])
    if (!claim || !eligibility)
      throw new Error("Expected a reserved trophy claim.")
    await ctx.db.patch(claim._id, {
      status: "claimed",
      soulboundStatus: "pending",
      soulboundAttemptCount: 0,
      mintAddress: "DevnetTrophy111111111111111111111111111111111",
    })
    await ctx.db.patch(eligibility._id, { claimStatus: "claimed" })
  })

  const claimId = await t.run(async (ctx) => {
    const claim = await ctx.db.query("trophyClaims").first()
    if (!claim) throw new Error("Expected a claimed trophy.")
    return claim._id
  })
  await t.mutation(internal.trophies.markFailed, {
    claimId,
    failureMessage: "Indexer not ready",
  })
  await t.mutation(internal.trophies.markSoulbound, {
    claimId,
    mintAddress: "DevnetTrophy111111111111111111111111111111111",
    transactionSignature: "locked-on-devnet",
  })

  await expect(
    t.run(async (ctx) => {
      const [claim, eligibility] = await Promise.all([
        ctx.db.get(claimId),
        ctx.db.query("trophyEligibility").first(),
      ])
      return { claim, eligibility }
    })
  ).resolves.toMatchObject({
    claim: {
      status: "claimed",
      soulboundStatus: "locked",
      soulboundAttemptCount: 1,
    },
    eligibility: { claimStatus: "claimed" },
  })
  await expect(
    t.run(async (ctx) => await ctx.db.get(claimId))
  ).resolves.not.toHaveProperty("failureMessage")
})
