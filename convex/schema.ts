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
    // A reliability flag may later clear, but the finished Recap Receipt must
    // retain the fact that the fixture had a degraded period.
    hadReliabilityIssue: v.optional(v.boolean()),
    lastScoreSeq: v.optional(v.number()),
    heat: v.optional(v.number()),
    heatUpdatedAt: v.optional(v.number()),
    peakHeat: v.optional(v.number()),
    peakHeatUpdatedAt: v.optional(v.number()),
    lastActivityHeatUpdateAt: v.optional(v.number()),
    lastPossessionHeatUpdateAt: v.optional(v.number()),
    pendingPossessionTicks: v.optional(v.number()),
    possession: v.optional(
      v.object({
        team: v.union(v.literal(1), v.literal(2)),
        intensity: v.union(
          v.literal("safe"),
          v.literal("attack"),
          v.literal("danger"),
          v.literal("highDanger")
        ),
        since: v.number(),
      })
    ),
    winProb1: v.optional(v.number()),
    drawProb: v.optional(v.number()),
    winProb2: v.optional(v.number()),
    // Present only when an operator has confirmed an observed StablePrice row.
    oddsProvenance: v.optional(
      v.object({
        bookmaker: v.string(),
        bookmakerId: v.number(),
        superOddsType: v.string(),
        marketPeriod: v.optional(v.string()),
        asOfTs: v.number(),
      })
    ),
    // The source heartbeat used to detect that a live display has gone stale.
    updatedAt: v.number(),
  })
    .index("by_fixtureId", ["fixtureId"])
    .index("by_phase", ["phase"]),

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

  // The permanent, fixture-level record derived from reconciled score events.
  // It contains only the classification a Match Room may render, never a
  // provider payload. Corrections retain the record for audit but retract it
  // from the public timeline.
  flashCards: defineTable({
    fixtureId: v.number(),
    // Score actions use provider numeric ids; odds rows use their immutable
    // source-event id so each observed swing remains correction-safe.
    actionId: v.union(v.number(), v.string()),
    type: v.union(
      v.literal("goal"),
      v.literal("card"),
      v.literal("corner"),
      v.literal("oddsSwing"),
      v.literal("varReview"),
      v.literal("varResolved"),
      v.literal("phaseChange"),
      v.literal("penaltyAwarded"),
      v.literal("penaltyResolved")
    ),
    title: v.string(),
    participant: v.optional(v.union(v.literal(1), v.literal(2))),
    probBefore: v.optional(v.number()),
    probAfter: v.optional(v.number()),
    oddsTaxonomyKey: v.optional(v.string()),
    impactScore: v.optional(v.number()),
    confirmed: v.literal(true),
    retracted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_fixtureId_and_actionId", ["fixtureId", "actionId"])
    .index("by_fixtureId_and_retracted", ["fixtureId", "retracted"]),

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

  // A compact operator-facing catalogue of rows actually observed in the odds
  // stream. It deliberately records no price history; immutable raw capture
  // remains the audit source.
  oddsTaxonomies: defineTable({
    fixtureId: v.number(),
    taxonomyKey: v.string(),
    bookmaker: v.string(),
    bookmakerId: v.number(),
    superOddsType: v.string(),
    marketPeriod: v.optional(v.string()),
    lastInRunning: v.boolean(),
    firstObservedAt: v.number(),
    lastObservedAt: v.number(),
    lastSourceEventId: v.string(),
    sampleCount: v.number(),
  }).index("by_fixtureId_and_taxonomyKey", ["fixtureId", "taxonomyKey"]),

  // There is intentionally one manually-confirmed StablePrice row. Its
  // fields are copied from an observed taxonomy, never supplied as a guessed
  // bookmaker or market fallback.
  oddsCanonicalRows: defineTable({
    key: v.literal("stablePrice"),
    taxonomyId: v.id("oddsTaxonomies"),
    taxonomyKey: v.string(),
    bookmaker: v.string(),
    bookmakerId: v.number(),
    superOddsType: v.string(),
    marketPeriod: v.optional(v.string()),
    confirmedAt: v.number(),
  }).index("by_key", ["key"]),

  // The global Match Room is created with its fixture. Public and private
  // Rooms are optional social spaces layered on top of that anonymous view.
  rooms: defineTable({
    fixtureId: v.number(),
    kind: v.union(
      v.literal("global"),
      v.literal("public"),
      v.literal("private")
    ),
    name: v.string(),
    hostUserId: v.optional(v.id("users")),
    createdAt: v.number(),
    frozen: v.boolean(),
  })
    .index("by_fixtureId", ["fixtureId"])
    .index("by_fixtureId_and_kind", ["fixtureId", "kind"]),

  roomMembers: defineTable({
    roomId: v.id("rooms"),
    fixtureId: v.number(),
    userId: v.id("users"),
    joinedAt: v.number(),
    // Predictions are introduced in ticket 11. Keeping the aggregate here
    // lets standings remain a bounded room read until then.
    score: v.number(),
  })
    .index("by_roomId", ["roomId"])
    .index("by_roomId_and_userId", ["roomId", "userId"])
    .index("by_roomId_and_score", ["roomId", "score"])
    .index("by_fixtureId_and_userId", ["fixtureId", "userId"]),

  chatMessages: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  })
    .index("by_roomId_and_createdAt", ["roomId", "createdAt"])
    .index("by_roomId_and_userId_and_createdAt", [
      "roomId",
      "userId",
      "createdAt",
    ]),

  roomReactions: defineTable({
    fixtureId: v.number(),
    flashCardId: v.id("flashCards"),
    roomId: v.id("rooms"),
    userId: v.id("users"),
    reaction: v.union(
      v.literal("cheer"),
      v.literal("wow"),
      v.literal("nervous")
    ),
    createdAt: v.number(),
  })
    .index("by_roomId_and_flashCardId", ["roomId", "flashCardId"])
    .index("by_fixtureId_and_createdAt", ["fixtureId", "createdAt"]),

  // Prompts are fixture-level and canonical. A prediction stores the Room
  // only as the social context for standings, never as prompt scope.
  predictionPrompts: defineTable({
    fixtureId: v.number(),
    flashCardId: v.id("flashCards"),
    sourceActionId: v.number(),
    template: v.union(v.literal("nextGoal"), v.literal("penaltyOutcome")),
    ruleKey: v.union(
      v.literal("nextGoal.confirmedGoalOrFullTime.v1"),
      v.literal("penaltyOutcome.confirmedOutcome.v1")
    ),
    lockRuleKey: v.literal("fixedWindow.v1"),
    voidRuleKey: v.literal("voidOnAffectingCorrection.v1"),
    question: v.string(),
    options: v.array(v.object({ id: v.string(), label: v.string() })),
    opensAt: v.number(),
    locksAt: v.number(),
    settlementRule: v.string(),
    settlementMethod: v.literal("pipeline"),
    status: v.union(
      v.literal("open"),
      v.literal("locked"),
      v.literal("settled"),
      v.literal("voided")
    ),
    winningOption: v.optional(v.string()),
    settledByActionId: v.optional(v.number()),
    settledAt: v.optional(v.number()),
  })
    .index("by_fixtureId", ["fixtureId"])
    .index("by_flashCardId", ["flashCardId"])
    .index("by_fixtureId_and_template_and_status", [
      "fixtureId",
      "template",
      "status",
    ]),

  predictions: defineTable({
    promptId: v.id("predictionPrompts"),
    roomId: v.id("rooms"),
    userId: v.id("users"),
    optionId: v.string(),
    createdAt: v.number(),
    result: v.optional(
      v.union(v.literal("win"), v.literal("loss"), v.literal("void"))
    ),
    pointsAwarded: v.optional(v.number()),
  })
    .index("by_promptId", ["promptId"])
    .index("by_promptId_and_userId", ["promptId", "userId"])
    .index("by_userId", ["userId"]),

  predictionCorrectionNotes: defineTable({
    fixtureId: v.number(),
    promptId: v.id("predictionPrompts"),
    message: v.string(),
    createdAt: v.number(),
  })
    .index("by_promptId", ["promptId"])
    .index("by_fixtureId", ["fixtureId"]),

  predictionCorrectionReviews: defineTable({
    fixtureId: v.number(),
    promptId: v.id("predictionPrompts"),
    sourceActionId: v.optional(v.number()),
    reason: v.string(),
    createdAt: v.number(),
    status: v.literal("pending"),
  }).index("by_fixtureId_and_status", ["fixtureId", "status"]),

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
    .index("by_fixtureId_and_userId", ["fixtureId", "userId"])
    .index("by_fixtureId_and_createdAt", ["fixtureId", "createdAt"]),

  // This intentionally contains no TxLINE-derived data. It is the minimal
  // record that survives the later Archive Mode claim-only path.
  trophyEligibility: defineTable({
    userId: v.id("users"),
    fixtureId: v.number(),
    eligibleAt: v.number(),
    claimStatus: v.union(
      v.literal("unclaimed"),
      v.literal("minting"),
      v.literal("claimed"),
      v.literal("failed")
    ),
  }).index("by_userId_and_fixtureId", ["userId", "fixtureId"]),

  // A tree is provisioned by an operator. Claiming only ever targets the one
  // active, non-public Devnet tree and reserves a leaf before it schedules an
  // on-chain mint.
  merkleTrees: defineTable({
    treeAddress: v.string(),
    collectionAddress: v.string(),
    capacity: v.number(),
    mintedCount: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_isActive", ["isActive"]),

  // The `(userId, fixtureId)` lookup is the transactional anti-double-claim
  // guard. A record is written before any non-transactional chain work starts.
  trophyClaims: defineTable({
    userId: v.id("users"),
    fixtureId: v.number(),
    treeId: v.id("merkleTrees"),
    treeAddress: v.string(),
    collectionAddress: v.string(),
    leafIndex: v.number(),
    status: v.union(
      v.literal("minting"),
      v.literal("claimed"),
      v.literal("failed")
    ),
    soulboundStatus: v.optional(
      v.union(v.literal("pending"), v.literal("locked"), v.literal("failed"))
    ),
    soulboundAttemptCount: v.optional(v.number()),
    mintAddress: v.optional(v.string()),
    metadataStorageId: v.optional(v.id("_storage")),
    metadataUrl: v.optional(v.string()),
    transactionSignature: v.optional(v.string()),
    soulboundTransactionSignature: v.optional(v.string()),
    failureMessage: v.optional(v.string()),
    claimedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_userId_and_fixtureId", ["userId", "fixtureId"]),
})

export type MatchFlashDataModel = DataModelFromSchemaDefinition<typeof schema>

export default schema
