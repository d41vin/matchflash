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

  // Stable fixture identity is separate from high-churn match state so
  // scoreboard writes do not rewrite fixture metadata for every viewer.
  fixtures: defineTable({
    fixtureId: v.number(),
    sport: v.literal("soccer"),
    competition: v.string(),
    stage: v.string(),
    participant1: v.string(),
    participant2: v.string(),
    startsAt: v.string(),
    lastTxlineTs: v.optional(v.number()),
  }).index("by_fixtureId", ["fixtureId"]),

  // This is the worker-owned, reconciled scoreboard state. It deliberately
  // contains no provider envelope and is the source for anonymous viewers.
  matchStates: defineTable({
    fixtureId: v.number(),
    phase: v.union(
      v.literal("upcoming"),
      v.literal("live"),
      v.literal("final")
    ),
    statusId: v.optional(v.number()),
    score1: v.number(),
    score2: v.number(),
    reliability: v.object({
      cornersReliable: v.boolean(),
      cardsReliable: v.boolean(),
      dataSuspended: v.boolean(),
      periodSuspectSinceAdjustment: v.optional(v.boolean()),
    }),
    lastScoreSeq: v.optional(v.number()),
    // The source heartbeat used to detect that a live display has gone stale.
    updatedAt: v.number(),
  }).index("by_fixtureId", ["fixtureId"]),

  // Mutable action records are internal reconciliation state. Source payloads
  // remain available only at the raw capture boundary and never reach a query.
  fixtureActions: defineTable({
    fixtureId: v.number(),
    actionId: v.number(),
    action: v.string(),
    sequence: v.optional(v.number()),
    discarded: v.boolean(),
    payload: v.any(),
    updatedAt: v.number(),
  }).index("by_fixtureId_and_actionId", ["fixtureId", "actionId"]),

  // This is the immutable capture boundary between TxLINE and every later
  // projection. Some administrative source messages do not name a fixture,
  // but are retained so a stream session can be audited faithfully.
  txlineEvents: defineTable({
    source: v.union(v.literal("scores"), v.literal("odds")),
    sourceEventId: v.string(),
    sseEventId: v.optional(v.string()),
    fixtureId: v.optional(v.number()),
    eventType: v.string(),
    sequence: v.optional(v.number()),
    occurredAt: v.optional(v.number()),
    raw: v.any(),
    capturedAt: v.number(),
  })
    .index("by_source_and_sourceEventId", ["source", "sourceEventId"])
    .index("by_fixtureId_and_capturedAt", ["fixtureId", "capturedAt"]),

  // Updated in the same transaction as a raw write. This is the durable
  // Last-Event-ID checkpoint used after a process, power, or network failure.
  txlineStreamCheckpoints: defineTable({
    source: v.union(v.literal("scores"), v.literal("odds")),
    lastEventId: v.string(),
    updatedAt: v.number(),
  }).index("by_source", ["source"]),

  liveReactions: defineTable({
    fixtureId: v.number(),
    userId: v.id("users"),
    reaction: v.union(
      v.literal("cheer"),
      v.literal("wow"),
      v.literal("nervous")
    ),
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
