import assert from "node:assert/strict"
import test from "node:test"

import {
  getMatchRoomProjection,
  listLobbyFixtures,
  projectMatchRoom,
} from "../lib/match-room-projection.ts"

test("lists fixture summaries that anonymous visitors can open", () => {
  const fixtures = listLobbyFixtures()

  assert.ok(fixtures.length > 0)
  assert.deepEqual(
    fixtures.map((fixture) => fixture.matchRoomHref),
    fixtures.map((fixture) => `/match/${fixture.fixtureId}`)
  )
  assert.ok(fixtures.every((fixture) => fixture.room.kind === "global"))
})

test("projects only safe fixture state and never leaks provider payloads", () => {
  const projection = projectMatchRoom({
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
    },
    rawProviderPayload: {
      bearerToken: "must-not-reach-a-browser",
      upstreamEnvelope: { action: "score_update" },
    },
  })

  assert.deepEqual(projection, {
    fixtureId: 42,
    competition: "World Cup 2026",
    stage: "Final",
    participant1: "Northshore",
    participant2: "Southport",
    startsAt: "2026-07-19T19:00:00.000Z",
    matchRoomHref: "/match/42",
    room: {
      kind: "global",
      name: "Match Room",
    },
    match: {
      status: "live",
      statusLabel: "LIVE · 64′",
      minute: 64,
      score1: 2,
      score2: 1,
    },
  })
  assert.equal("rawProviderPayload" in projection, false)
})

test("returns a coherent projection for a known fixture and none for an unknown fixture", () => {
  const fixture = listLobbyFixtures()[0]

  assert.deepEqual(getMatchRoomProjection(fixture.fixtureId), fixture)
  assert.equal(getMatchRoomProjection(-1), null)
})

test("does not invent a live match minute when the source has not provided one", () => {
  const projection = projectMatchRoom({
    fixtureId: 84,
    competition: "World Cup 2026",
    stage: "Match day",
    participant1: "Northshore",
    participant2: "Southport",
    startsAt: "2026-07-19T19:00:00.000Z",
    state: { phase: "live", score1: 0, score2: 0 },
  })

  assert.equal(projection.match.statusLabel, "LIVE")
  assert.equal(projection.match.minute, undefined)
})
