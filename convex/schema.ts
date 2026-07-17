import {
  type DataModelFromSchemaDefinition,
  defineSchema,
  defineTable,
} from "convex/server"
import { v } from "convex/values"

export const schema = defineSchema({
  users: defineTable({
    authSubject: v.string(),
    tokenIdentifier: v.string(),
    walletAddress: v.string(),
    displayName: v.string(),
    avatarColor: v.string(),
    createdAt: v.number(),
  })
    .index("by_authSubject", ["authSubject"])
    .index("by_tokenIdentifier", ["tokenIdentifier"]),

  // Ticket 03's worker is the only writer for fixture phase. A reaction can
  // never make itself live by sending a client-controlled flag.
  fixtureStates: defineTable({
    fixtureId: v.number(),
    phase: v.union(
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("final"),
      v.literal("replay")
    ),
    updatedAt: v.number(),
  }).index("by_fixtureId", ["fixtureId"]),

  liveReactions: defineTable({
    fixtureId: v.number(),
    userId: v.id("users"),
    reaction: v.union(v.literal("cheer"), v.literal("wow"), v.literal("nervous")),
    createdAt: v.number(),
  })
    .index("by_fixtureId", ["fixtureId"])
    .index("by_fixtureId_and_userId", ["fixtureId", "userId"]),

  // This intentionally contains no TxLINE-derived data. It is the minimal
  // record that survives the later Archive Mode claim-only path.
  trophyEligibility: defineTable({
    userId: v.id("users"),
    fixtureId: v.number(),
    eligibleAt: v.number(),
    claimStatus: v.literal("unclaimed"),
  }).index("by_userId_and_fixtureId", ["userId", "fixtureId"]),
})

export type MatchFlashDataModel = DataModelFromSchemaDefinition<typeof schema>

export default schema
