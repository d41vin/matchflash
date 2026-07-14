# Data Model (Convex)

The complete schema, current as of the final design pass. Written as a `convex/schema.ts`-shaped reference — copy the shape, adjust to taste. Tables are grouped by what they serve rather than in the order they were originally introduced, since a few have changed purpose since.

```typescript
import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  users: defineTable({
    displayName: v.string(),
    avatarColor: v.string(),
    walletAddress: v.optional(v.string()), // every auth path now produces one; kept optional for safety, but expect it always populated in practice
    createdAt: v.number(),
  }),

  // sport is new: single value today ("soccer"), costs nothing, makes a
  // second sport additive later instead of a migration.
  fixtures: defineTable({
    fixtureId: v.number(),
    sport: v.string(), // "soccer" for now
    competitionId: v.number(),
    competition: v.string(),
    fixtureGroupId: v.optional(v.number()),
    participant1: v.string(),
    participant2: v.string(),
    participant1Id: v.number(),
    participant2Id: v.number(),
    participant1IsHome: v.boolean(), // feed convention; confirm actual neutrality via the `venue` action, not this field
    startTime: v.string(),
    lastTxLineTs: v.optional(v.number()),
  })
    .index("by_fixtureId", ["fixtureId"])
    .index("by_competition", ["competitionId"]),

  // heat/heatUpdatedAt: see 03-event-pipeline-and-flash-cards.md for the
  // updated formula. reliability now includes an explicit period-scoped
  // suspicion flag driven automatically by Score Adjustment, not just a
  // narrative note (Design Principle 6).
  matchStates: defineTable({
    fixtureId: v.number(),
    score1: v.number(),
    score2: v.number(),
    gameState: v.string(), // StatusId-derived
    minuteEstimate: v.number(),
    redCards1: v.number(),
    redCards2: v.number(),
    corners1: v.number(),
    corners2: v.number(),
    winProb1: v.optional(v.number()),
    drawProb: v.optional(v.number()),
    winProb2: v.optional(v.number()),
    oddsProvenance: v.optional(
      v.object({
        bookmaker: v.string(), // very likely a StablePrice-branded row — confirm via discovery, see 01 §7
        superOddsType: v.string(),
        marketPeriod: v.optional(v.string()),
        asOfTs: v.number(),
      })
    ),
    possession: v.optional(
      v.object({
        team: v.number(), // 1 | 2
        intensity: v.union(
          v.literal("safe"),
          v.literal("attack"),
          v.literal("danger"),
          v.literal("highDanger")
        ),
        since: v.number(),
      })
    ),
    reliability: v.object({
      cornersReliable: v.boolean(),
      cardsReliable: v.boolean(),
      dataSuspended: v.boolean(),
      // set automatically whenever a Score Adjustment fires for the current
      // period; cleared on the next halftime_finalised or explicit
      // reliability-clearing signal for that period.
      periodSuspectSinceAdjustment: v.optional(v.boolean()),
    }),
    heat: v.number(),
    heatUpdatedAt: v.number(),
    lastScoreSeq: v.optional(v.number()),
    updatedAt: v.number(), // also the heartbeat used for live-feed-health staleness detection
  }).index("by_fixtureId", ["fixtureId"]),

  // kind replaces the old plain visibility field: "global" is the one
  // auto-created room every fan lands in from a fixture; "public"/"private"
  // are the opt-in social layer on top.
  rooms: defineTable({
    fixtureId: v.number(),
    kind: v.union(
      v.literal("global"),
      v.literal("public"),
      v.literal("private")
    ),
    name: v.string(),
    hostUserId: v.optional(v.id("users")), // absent for the auto-created global room
    createdAt: v.number(),
    replayMode: v.boolean(),
    frozen: v.boolean(), // true once the fixture has finished; read-only from that point
  })
    .index("by_fixtureId", ["fixtureId"])
    .index("by_fixture_and_kind", ["fixtureId", "kind"]),

  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    joinedAt: v.number(),
    score: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  players: defineTable({
    fixtureId: v.number(),
    playerId: v.number(),
    participant: v.number(), // 1 | 2
    preferredName: v.string(),
    positionId: v.optional(v.number()),
    unitId: v.optional(v.number()), // used for the field viz's schematic formation grouping — confirm what values actually mean before building tactical narrative on top of it
    rosterNumber: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_fixture_and_player", ["fixtureId", "playerId"]),

  txlineEvents: defineTable({
    fixtureId: v.number(),
    source: v.union(v.literal("scores"), v.literal("odds")),
    txLineMessageId: v.string(),
    seq: v.optional(v.number()),
    ts: v.number(),
    eventType: v.string(),
    confirmed: v.optional(v.boolean()),
    status: v.union(
      v.literal("active"),
      v.literal("amended"),
      v.literal("discarded")
    ),
    targetActionId: v.optional(v.number()),
    raw: v.any(),
    processedAt: v.number(),
  })
    .index("by_fixture_and_seq", ["fixtureId", "seq"])
    .index("by_fixture_and_actionId", ["fixtureId", "targetActionId"]),

  // flashType now covers the expanded catalog from 03: shot (woodwork only),
  // injury (merged with its resulting substitution via FollowsAction),
  // comment (severity: warning only), penalty (two-stage), weather.
  flashes: defineTable({
    fixtureId: v.number(),
    roomId: v.optional(v.id("rooms")), // optional deliberately — a flash's content is fixture-level; only its room-scoped predictions/reactions are room-specific
    eventId: v.id("txlineEvents"),
    flashType: v.union(
      v.literal("goal"),
      v.literal("card"),
      v.literal("corner"),
      v.literal("oddsSwing"),
      v.literal("anticipation"),
      v.literal("varReview"),
      v.literal("varResolved"),
      v.literal("penaltyAwarded"),
      v.literal("penaltyResolved"),
      v.literal("additionalTime"),
      v.literal("shot"), // woodwork only
      v.literal("injury"),
      v.literal("comment"), // reporter narrative, severity: warning only
      v.literal("weather"),
      v.literal("atmosphere"),
      v.literal("possessionPressure")
    ),
    title: v.string(),
    explanation: v.optional(v.string()),
    relatedPlayerId: v.optional(v.number()),
    probBefore: v.optional(v.number()),
    probAfter: v.optional(v.number()),
    impactScore: v.number(),
    hatTrickTier: v.optional(
      v.union(v.literal("brace"), v.literal("hatTrick"))
    ), // set when the same player's running goal count in this match justifies it
    confirmed: v.boolean(),
    retracted: v.optional(v.boolean()),
    supersededByFlashId: v.optional(v.id("flashes")),
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_fixture", ["fixtureId"]),

  // settlementMethod is new: defaults to "pipeline" (settled from this app's
  // own data). "onchain" exists as a value now so headline-prediction
  // settlement via the predicate validator can be added later without a
  // schema migration — deliberately not built for this version, see
  // 03-event-pipeline-and-flash-cards.md §7.
  prompts: defineTable({
    flashId: v.id("flashes"),
    roomId: v.id("rooms"),
    question: v.string(),
    options: v.array(v.string()),
    opensAt: v.number(),
    locksAt: v.number(),
    settlementRule: v.string(),
    settlementMethod: v.union(v.literal("pipeline"), v.literal("onchain")),
    status: v.union(
      v.literal("open"),
      v.literal("locked"),
      v.literal("settled"),
      v.literal("voided")
    ),
    winningOption: v.optional(v.string()),
    settledAt: v.optional(v.number()),
  }).index("by_room", ["roomId"]),

  predictions: defineTable({
    promptId: v.id("prompts"),
    roomId: v.id("rooms"),
    userId: v.id("users"),
    optionId: v.string(),
    createdAt: v.number(),
    result: v.optional(
      v.union(v.literal("win"), v.literal("loss"), v.literal("void"))
    ),
    pointsAwarded: v.optional(v.number()),
  })
    .index("by_prompt", ["promptId"])
    .index("by_room_and_user", ["roomId", "userId"])
    .index("by_user", ["userId"]), // powers the app-wide leaderboard and the profile history list

  reactions: defineTable({
    flashId: v.id("flashes"),
    roomId: v.id("rooms"), // room-scoped by design; Heat aggregates across all of a fixture's rooms, not per-room — see 03
    userId: v.id("users"),
    reaction: v.string(),
    createdAt: v.number(),
  })
    .index("by_flash", ["flashId"])
    .index("by_user", ["userId"]),

  recaps: defineTable({
    roomId: v.id("rooms"),
    fixtureId: v.number(),
    headline: v.string(),
    bestCallUserId: v.optional(v.id("users")),
    biggestSwingFlashId: v.optional(v.id("flashes")),
    peakHeat: v.optional(v.number()),
    summary: v.string(),
    dataQualityNote: v.optional(v.string()),
    shareImageUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_fixture", ["fixtureId"]),
  // Note: recap visibility (everyone sees match-level facts; only
  // participants see personal stats + the claim button) is a query-time
  // decision, not a schema field — see 05-cnft-and-recap.md.

  proofs: defineTable({
    fixtureId: v.number(),
    seq: v.number(),
    statKey: v.number(),
    flashId: v.optional(v.id("flashes")),
    validationPayload: v.any(),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("failed")
    ),
    createdAt: v.number(),
  }).index("by_fixture", ["fixtureId"]),

  // New: cNFT infrastructure.
  merkleTrees: defineTable({
    treeAddress: v.string(),
    capacity: v.number(),
    mintedCount: v.number(),
    isActive: v.boolean(), // exactly one true at a time; mint logic always targets this row
    createdAt: v.number(),
  }).index("by_active", ["isActive"]),

  trophyClaims: defineTable({
    userId: v.id("users"),
    fixtureId: v.number(),
    mintAddress: v.string(),
    treeAddress: v.string(),
    claimedAt: v.number(),
  }).index("by_user_and_fixture", ["userId", "fixtureId"]), // unique in practice — enforced at the mutation level
})
```

## What changed from the original pass, and why

- **`rooms.kind` replaces `visibility`.** Every fixture gets exactly one auto-created `kind: "global"` room the moment it's relevant — this is what `/match/[id]` resolves to directly, with no separate lobby/preview screen. `public`/`private` are the opt-in layer, created through the join/create sheet.
- **`rooms.frozen`** is new — set true once the fixture finishes, so room UI can render the "View Rooms" / read-only post-match state cleanly from one field rather than deriving it from the fixture's status every time.
- **`flashes.roomId` stays optional** for the same reason it always was: a flash's content is fixture-level (a goal is a goal regardless of which room is watching it); only the room-scoped prediction/reaction instances that hang off it are room-specific.
- **`prompts.settlementMethod`** is the cheap hook for on-chain settlement, deliberately unused for this version — see Design Principle 8.
- **`flashes.hatTrickTier`** is new — a genuinely free narrative signal once you're already tracking per-player goal counts within a match.
- **`matchStates.reliability.periodSuspectSinceAdjustment`** makes the "a Score Adjustment casts doubt on other stats in that period" rule structural rather than something only mentioned in a recap's prose.
- **`merkleTrees`** and **`trophyClaims`** are new, covering the cNFT feature end to end — see `05-cnft-and-recap.md` for how they're actually used.
- **`predictions.by_user`** and **`reactions.by_user`** indexes are new — they're what the app-wide leaderboard and the profile's participation history both query against; the "did this user participate in this fixture" check (NFT eligibility, recap visibility) is the same query reused a third time.
