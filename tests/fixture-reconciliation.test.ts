import assert from "node:assert/strict"
import test from "node:test"

import {
  feedHealthFor,
  reconcileFixtureEvent,
} from "../lib/fixture-reconciliation.ts"

test("projects an authoritative score adjustment and marks that period's stats suspect", () => {
  const result = reconcileFixtureEvent(
    undefined,
    {
      FixtureInfo: {
        FixtureId: 42,
        Competition: "World Cup 2026",
        FixtureGroup: "World Cup > Final",
        Participant1: "Northshore",
        Participant2: "Southport",
        StartTime: "2026-07-19T19:00:00.000Z",
      },
      Update: {
        Action: "score_adjustment",
        Id: 77,
        Seq: 18,
        Ts: 1_784_390_400_000,
        StatusId: 4,
        Score: {
          Participant1: { Total: { Goals: 2 } },
          Participant2: { Total: { Goals: 1 } },
        },
      },
    },
    1_784_390_401_000
  )

  assert.deepEqual(result, {
    fixture: {
      fixtureId: 42,
      competition: "World Cup 2026",
      stage: "World Cup > Final",
      participant1: "Northshore",
      participant2: "Southport",
      startsAt: "2026-07-19T19:00:00.000Z",
    },
    state: {
      fixtureId: 42,
      phase: "live",
      statusId: 4,
      score1: 2,
      score2: 1,
      reliability: {
        cornersReliable: true,
        cardsReliable: true,
        dataSuspended: false,
        periodSuspectSinceAdjustment: true,
      },
      lastScoreSeq: 18,
      updatedAt: 1_784_390_401_000,
    },
    action: {
      fixtureId: 42,
      actionId: 77,
      action: "score_adjustment",
      sequence: 18,
      discarded: false,
    },
  })
})

test("reconciles the flat score-stream envelope after fixture metadata is already known", () => {
  const result = reconcileFixtureEvent(
    {
      fixture: {
        fixtureId: 42,
        competition: "World Cup 2026",
        stage: "Fixture group 9",
        participant1: "Northshore",
        participant2: "Southport",
        startsAt: "2026-07-19T19:00:00.000Z",
      },
      state: {
        fixtureId: 42,
        phase: "live",
        score1: 1,
        score2: 0,
        reliability: {
          cornersReliable: true,
          cardsReliable: true,
          dataSuspended: false,
        },
        updatedAt: 1,
      },
    },
    {
      FixtureId: 42,
      Action: "yellow_card",
      Id: 88,
      Seq: 19,
      StatusId: 4,
      Score: {
        Participant1: { Total: { Goals: 2 } },
        Participant2: { Total: { Goals: 1 } },
      },
    },
    2
  )

  assert.deepEqual(result?.state, {
    fixtureId: 42,
    phase: "live",
    statusId: 4,
    score1: 2,
    score2: 1,
    reliability: {
      cornersReliable: true,
      cardsReliable: true,
      dataSuspended: false,
    },
    lastScoreSeq: 19,
    updatedAt: 2,
  })
  assert.deepEqual(result?.action, {
    fixtureId: 42,
    actionId: 88,
    action: "yellow_card",
    sequence: 19,
    discarded: false,
  })
})

test("keeps the scoreboard stable for an amendment and applies the discard's authoritative score", () => {
  const current = {
    fixture: {
      fixtureId: 42,
      competition: "World Cup 2026",
      stage: "World Cup > Final",
      participant1: "Northshore",
      participant2: "Southport",
      startsAt: "2026-07-19T19:00:00.000Z",
    },
    state: {
      fixtureId: 42,
      phase: "live" as const,
      statusId: 4,
      score1: 2,
      score2: 1,
      reliability: {
        cornersReliable: true,
        cardsReliable: true,
        dataSuspended: false,
      },
      lastScoreSeq: 18,
      updatedAt: 1,
    },
  }

  const amended = reconcileFixtureEvent(
    current,
    {
      FixtureInfo: { FixtureId: 42 },
      Update: {
        Action: "action_amend",
        Id: 90,
        Seq: 19,
        StatusId: 2,
        Data: { Action: "goal", Id: 88, New: { PlayerId: 7 } },
      },
    },
    2
  )

  assert.deepEqual(amended?.state, {
    ...current.state,
    score1: 2,
    score2: 1,
    lastScoreSeq: 19,
    updatedAt: 2,
  })
  assert.deepEqual(amended?.action, {
    fixtureId: 42,
    actionId: 88,
    action: "goal",
    sequence: 19,
    discarded: false,
  })

  const discarded = reconcileFixtureEvent(
    amended,
    {
      FixtureInfo: { FixtureId: 42 },
      Update: {
        Action: "action_discarded",
        Id: 88,
        Seq: 20,
        StatusId: 2,
        Score: {
          Participant1: { Total: { Goals: 1 } },
          Participant2: { Total: { Goals: 1 } },
        },
      },
    },
    3
  )

  assert.equal(discarded?.state.score1, 1)
  assert.equal(discarded?.state.score2, 1)
  assert.deepEqual(discarded?.action, {
    fixtureId: 42,
    actionId: 88,
    action: "action_discarded",
    sequence: 20,
    discarded: true,
  })
})

test("surfaces reliability signals and stale-feed health instead of presenting degraded data as live", () => {
  const current = {
    fixture: {
      fixtureId: 42,
      competition: "World Cup 2026",
      stage: "World Cup > Final",
      participant1: "Northshore",
      participant2: "Southport",
      startsAt: "2026-07-19T19:00:00.000Z",
    },
    state: {
      fixtureId: 42,
      phase: "live" as const,
      score1: 1,
      score2: 1,
      reliability: {
        cornersReliable: true,
        cardsReliable: true,
        dataSuspended: false,
      },
      updatedAt: 1_000,
    },
  }

  const suspended = reconcileFixtureEvent(
    current,
    {
      FixtureInfo: { FixtureId: 42 },
      Update: {
        Action: "suspend",
        Id: 10,
        Seq: 4,
        Data: { Reliable: false },
      },
    },
    2_000
  )
  assert.ok(suspended)
  const unreliableCorners = reconcileFixtureEvent(
    suspended,
    {
      FixtureInfo: { FixtureId: 42 },
      Update: {
        Action: "unreliable_corners",
        Id: 11,
        Seq: 5,
        Data: { Unreliable: true },
      },
    },
    3_000
  )

  assert.deepEqual(unreliableCorners?.state.reliability, {
    cornersReliable: false,
    cardsReliable: true,
    dataSuspended: true,
  })
  assert.deepEqual(feedHealthFor(3_000, 92_999), { kind: "current" })
  assert.deepEqual(feedHealthFor(3_000, 93_000), { kind: "stale" })
})

test("does not present provider coverage suspension as healthy live data", () => {
  const result = reconcileFixtureEvent(
    {
      fixture: {
        fixtureId: 42,
        competition: "World Cup 2026",
        stage: "World Cup > Final",
        participant1: "Northshore",
        participant2: "Southport",
        startsAt: "2026-07-19T19:00:00.000Z",
      },
      state: {
        fixtureId: 42,
        phase: "live",
        statusId: 4,
        score1: 1,
        score2: 1,
        reliability: {
          cornersReliable: true,
          cardsReliable: true,
          dataSuspended: false,
        },
        updatedAt: 1,
      },
    },
    {
      FixtureInfo: { FixtureId: 42 },
      Update: { Action: "status", Id: 12, Seq: 6, StatusId: 18, Data: {} },
    },
    2
  )

  assert.equal(result?.state.phase, "live")
  assert.equal(result?.state.reliability.dataSuspended, true)
})
