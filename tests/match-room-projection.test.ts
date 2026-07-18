import assert from "node:assert/strict"
import test from "node:test"

import { projectMatchRoom } from "../lib/match-room-projection.ts"

test("projects only reconciled safe fixture state and never leaks provider payloads", () => {
  const projection = projectMatchRoom(
    {
      fixtureId: 42,
      competition: "World Cup 2026",
      stage: "Final",
      participant1: "Northshore",
      participant2: "Southport",
      startsAt: "2026-07-19T19:00:00.000Z",
      state: {
        phase: "live",
        minute: 64,
        score1: 2,
        score2: 1,
        reliability: {
          cornersReliable: true,
          cardsReliable: true,
          dataSuspended: false,
        },
        updatedAt: 1_000,
      },
      rawProviderPayload: {
        bearerToken: "must-not-reach-a-browser",
        upstreamEnvelope: { action: "score_update" },
      },
    },
    1_000
  )

  assert.equal(projection.match.statusLabel, "LIVE · 64′")
  assert.deepEqual(projection.feed, {
    updatedAt: 1_000,
    health: "current",
    reliability: {
      cornersReliable: true,
      cardsReliable: true,
      dataSuspended: false,
    },
  })
  assert.equal("rawProviderPayload" in projection, false)
})

test("labels a stale source feed explicitly", () => {
  const projection = projectMatchRoom(
    {
      fixtureId: 84,
      competition: "World Cup 2026",
      stage: "Match day",
      participant1: "Northshore",
      participant2: "Southport",
      startsAt: "2026-07-19T19:00:00.000Z",
      state: {
        phase: "live",
        score1: 0,
        score2: 0,
        reliability: {
          cornersReliable: true,
          cardsReliable: true,
          dataSuspended: false,
        },
        updatedAt: 0,
      },
    },
    90_000
  )

  assert.equal(projection.feed.health, "stale")
})
