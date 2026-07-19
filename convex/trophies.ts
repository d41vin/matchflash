import { v } from "convex/values"

import { internal } from "./_generated/api"
import { internalMutation, internalQuery, mutation } from "./_generated/server"

export const getActiveTree = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("merkleTrees")
      .withIndex("by_isActive", (query) => query.eq("isActive", true))
      .unique()
  },
})

export const registerMainnetTree = internalMutation({
  args: {
    treeAddress: v.string(),
    collectionAddress: v.string(),
    capacity: v.number(),
    treeRentLamports: v.string(),
    collectionTransactionSignature: v.string(),
    treeTransactionSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("merkleTrees")
      .withIndex("by_isActive", (query) => query.eq("isActive", true))
      .unique()
    if (existing) return existing

    const treeId = await ctx.db.insert("merkleTrees", {
      treeAddress: args.treeAddress,
      collectionAddress: args.collectionAddress,
      capacity: args.capacity,
      mintedCount: 0,
      isActive: true,
      createdAt: Date.now(),
    })
    return {
      treeId,
      treeAddress: args.treeAddress,
      collectionAddress: args.collectionAddress,
      capacity: args.capacity,
      treeRentLamports: args.treeRentLamports,
      collectionTransactionSignature: args.collectionTransactionSignature,
      treeTransactionSignature: args.treeTransactionSignature,
    }
  },
})

export const requestClaim = mutation({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error("Sign in to claim your Digital Trophy.")

    const user = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (query) =>
        query.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique()
    if (!user) throw new Error("Your signed-in wallet could not be found.")

    const [eligibility, state, existingClaim] = await Promise.all([
      ctx.db
        .query("trophyEligibility")
        .withIndex("by_userId_and_fixtureId", (query) =>
          query.eq("userId", user._id).eq("fixtureId", args.fixtureId)
        )
        .unique(),
      ctx.db
        .query("matchStates")
        .withIndex("by_fixtureId", (query) =>
          query.eq("fixtureId", args.fixtureId)
        )
        .unique(),
      ctx.db
        .query("trophyClaims")
        .withIndex("by_userId_and_fixtureId", (query) =>
          query.eq("userId", user._id).eq("fixtureId", args.fixtureId)
        )
        .unique(),
    ])
    if (!eligibility) {
      throw new Error(
        "A server-recorded live participation is required to claim this trophy."
      )
    }
    if (!state || state.phase !== "final") {
      throw new Error("Digital Trophies can be claimed after full time.")
    }
    if (existingClaim?.status === "failed") {
      await ctx.db.patch(existingClaim._id, { status: "minting" })
      await ctx.db.patch(eligibility._id, { claimStatus: "minting" })
      await ctx.scheduler.runAfter(0, internal.trophy_mint.mintReserved, {
        claimId: existingClaim._id,
      })
      return { status: "minting" as const }
    }
    if (
      existingClaim?.status === "claimed" &&
      existingClaim.soulboundStatus !== "locked"
    ) {
      await ctx.scheduler.runAfter(0, internal.trophy_mint.secureMinted, {
        claimId: existingClaim._id,
      })
      return { status: "claimed" as const }
    }
    if (existingClaim || eligibility.claimStatus !== "unclaimed") {
      throw new Error(
        "A Digital Trophy has already been requested for this fixture."
      )
    }

    const tree = await ctx.db
      .query("merkleTrees")
      .withIndex("by_isActive", (query) => query.eq("isActive", true))
      .unique()
    if (!tree || tree.mintedCount >= tree.capacity) {
      throw new Error(
        "All free MatchFlash trophies in the current run have been claimed."
      )
    }

    const createdAt = Date.now()
    const claimId = await ctx.db.insert("trophyClaims", {
      userId: user._id,
      fixtureId: args.fixtureId,
      treeId: tree._id,
      treeAddress: tree.treeAddress,
      collectionAddress: tree.collectionAddress,
      leafIndex: tree.mintedCount,
      status: "minting",
      createdAt,
    })
    await ctx.db.patch(tree._id, { mintedCount: tree.mintedCount + 1 })
    await ctx.db.patch(eligibility._id, { claimStatus: "minting" })
    await ctx.scheduler.runAfter(0, internal.trophy_mint.mintReserved, {
      claimId,
    })

    return { status: "minting" as const }
  },
})

export const getReservation = internalQuery({
  args: { claimId: v.id("trophyClaims") },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId)
    if (!claim || claim.status !== "minting") return null
    const [fixture, matchState, user] = await Promise.all([
      ctx.db
        .query("fixtures")
        .withIndex("by_fixtureId", (query) =>
          query.eq("fixtureId", claim.fixtureId)
        )
        .unique(),
      ctx.db
        .query("matchStates")
        .withIndex("by_fixtureId", (query) =>
          query.eq("fixtureId", claim.fixtureId)
        )
        .unique(),
      ctx.db.get(claim.userId),
    ])
    if (!fixture || !matchState || !user || matchState.phase !== "final")
      return null
    return { ...claim, fixture, matchState, user }
  },
})

export const getSecuringReservation = internalQuery({
  args: { claimId: v.id("trophyClaims") },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId)
    if (
      !claim ||
      claim.status !== "claimed" ||
      claim.soulboundStatus === "locked" ||
      !claim.mintAddress
    )
      return null
    return claim
  },
})

export const markSoulbound = internalMutation({
  args: {
    claimId: v.id("trophyClaims"),
    mintAddress: v.string(),
    transactionSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId)
    if (!claim || claim.status !== "claimed") return
    const {
      _id,
      _creationTime,
      failureMessage: _failureMessage,
      ...claimData
    } = claim
    await ctx.db.replace(claim._id, {
      ...claimData,
      mintAddress: args.mintAddress,
      soulboundStatus: "locked",
      soulboundTransactionSignature: args.transactionSignature,
    })
  },
})

export const markMinted = internalMutation({
  args: {
    claimId: v.id("trophyClaims"),
    mintAddress: v.string(),
    metadataStorageId: v.id("_storage"),
    metadataUrl: v.string(),
    transactionSignature: v.string(),
  },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId)
    if (!claim || claim.status !== "minting") return
    const eligibility = await ctx.db
      .query("trophyEligibility")
      .withIndex("by_userId_and_fixtureId", (query) =>
        query.eq("userId", claim.userId).eq("fixtureId", claim.fixtureId)
      )
      .unique()
    if (!eligibility)
      throw new Error("Missing Digital Trophy eligibility record.")
    await ctx.db.patch(claim._id, {
      status: "claimed",
      soulboundStatus: "pending",
      soulboundAttemptCount: 0,
      mintAddress: args.mintAddress,
      metadataStorageId: args.metadataStorageId,
      metadataUrl: args.metadataUrl,
      transactionSignature: args.transactionSignature,
      claimedAt: Date.now(),
    })
    await ctx.db.patch(eligibility._id, { claimStatus: "claimed" })
  },
})

export const markFailed = internalMutation({
  args: { claimId: v.id("trophyClaims"), failureMessage: v.string() },
  handler: async (ctx, args) => {
    const claim = await ctx.db.get(args.claimId)
    if (!claim) return
    const eligibility = await ctx.db
      .query("trophyEligibility")
      .withIndex("by_userId_and_fixtureId", (query) =>
        query.eq("userId", claim.userId).eq("fixtureId", claim.fixtureId)
      )
      .unique()
    if (claim.status === "minting") {
      await ctx.db.patch(claim._id, {
        status: "failed",
        failureMessage: args.failureMessage,
      })
      if (eligibility) {
        await ctx.db.patch(eligibility._id, { claimStatus: "failed" })
      }
      return
    }
    const soulboundAttemptCount = (claim.soulboundAttemptCount ?? 0) + 1
    await ctx.db.patch(claim._id, {
      soulboundStatus: "failed",
      soulboundAttemptCount,
      failureMessage: args.failureMessage,
    })
    await ctx.scheduler.runAfter(
      soulboundAttemptCount <= 8 ? 30_000 : 5 * 60_000,
      internal.trophy_mint.secureMinted,
      { claimId: claim._id }
    )
  },
})
