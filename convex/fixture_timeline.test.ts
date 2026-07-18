/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { expect, test, vi } from "vitest"

import { api, internal } from "./_generated/api"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")

const fixtureInfo = {
  FixtureId: 42,
  Competition: "World Cup 2026",
  FixtureGroup: "World Cup > Final",
  Participant1: "Northshore",
  Participant2: "Southport",
  StartTime: "2026-07-19T19:00:00.000Z",
}

test("projects confirmed core actions as fixture-level Flash Cards", async () => {
  const t = convexTest(schema, modules)

  for (const [sourceEventId, action, id] of [
    ["card-1", "yellow_card", 1],
    ["corner-2", "corner", 2],
    ["half-3", "halftime_finalised", 3],
  ] as const) {
    await t.mutation(internal.ingestion.captureRawEvent, {
      source: "scores",
      sourceEventId,
      fixtureId: 42,
      eventType: action,
      raw: {
        FixtureInfo: fixtureInfo,
        Update: {
          Action: action,
          Id: id,
          Seq: id,
          Confirmed: true,
          StatusId: 4,
        },
      },
    })
  }

  expect(await t.query(api.fixture_timeline.list, { fixtureId: 42 })).toEqual([
    expect.objectContaining({ actionId: 1, type: "card", retracted: false }),
    expect.objectContaining({ actionId: 2, type: "corner", retracted: false }),
    expect.objectContaining({
      actionId: 3,
      type: "phaseChange",
      retracted: false,
    }),
  ])
})

test("keeps possible, unconfirmed, ordinary, and ambient actions out of the permanent timeline", async () => {
  const t = convexTest(schema, modules)

  for (const [sourceEventId, action, id, confirmed] of [
    ["possible-1", "possible", 1, true],
    ["unconfirmed-goal-2", "goal", 2, false],
    ["ordinary-shot-3", "shot", 3, true],
    ["possession-4", "high_danger_possession", 4, true],
    ["goal-5", "goal", 5, true],
  ] as const) {
    await t.mutation(internal.ingestion.captureRawEvent, {
      source: "scores",
      sourceEventId,
      fixtureId: 42,
      eventType: action,
      raw: {
        FixtureInfo: fixtureInfo,
        Update: {
          Action: action,
          Id: id,
          Seq: id,
          Confirmed: confirmed,
          StatusId: 4,
        },
      },
    })
  }

  expect(await t.query(api.fixture_timeline.list, { fixtureId: 42 })).toEqual([
    expect.objectContaining({ actionId: 5, type: "goal", retracted: false }),
  ])
})

test("applies a confirmed source amendment to its existing Flash Card", async () => {
  vi.useFakeTimers()
  try {
    const t = convexTest(schema, modules)
    vi.setSystemTime(1_000)
    await t.mutation(internal.ingestion.captureRawEvent, {
      source: "scores",
      sourceEventId: "card-1",
      fixtureId: 42,
      eventType: "yellow_card",
      raw: {
        FixtureInfo: fixtureInfo,
        Update: {
          Action: "yellow_card",
          Id: 1,
          Seq: 1,
          Confirmed: true,
          StatusId: 4,
        },
      },
    })
    vi.setSystemTime(2_000)
    await t.mutation(internal.ingestion.captureRawEvent, {
      source: "scores",
      sourceEventId: "amend-2",
      fixtureId: 42,
      eventType: "action_amend",
      raw: {
        FixtureInfo: fixtureInfo,
        Update: {
          Action: "action_amend",
          Id: 2,
          Seq: 2,
          StatusId: 4,
          Data: { Action: "yellow_card", Id: 1, New: {} },
        },
      },
    })

    expect(await t.query(api.fixture_timeline.list, { fixtureId: 42 })).toEqual(
      [
        expect.objectContaining({
          actionId: 1,
          type: "card",
          retracted: false,
          updatedAt: 2_000,
        }),
      ]
    )
  } finally {
    vi.useRealTimers()
  }
})

test("retracts a Flash Card when a source amendment declassifies it", async () => {
  const t = convexTest(schema, modules)

  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "final-1",
    fixtureId: 42,
    eventType: "status",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: { Action: "status", Id: 1, Seq: 1, Confirmed: true, StatusId: 5 },
    },
  })
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "amend-2",
    fixtureId: 42,
    eventType: "action_amend",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: {
        Action: "action_amend",
        Id: 2,
        Seq: 2,
        StatusId: 4,
        Data: { Action: "status", Id: 1, New: { StatusId: 4 } },
      },
    },
  })

  expect(await t.query(api.fixture_timeline.list, { fixtureId: 42 })).toEqual(
    []
  )
})

test("retracts a discarded Flash Card and gates cards while the source is unreliable", async () => {
  const t = convexTest(schema, modules)

  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "card-1",
    fixtureId: 42,
    eventType: "yellow_card",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: {
        Action: "yellow_card",
        Id: 1,
        Seq: 1,
        Confirmed: true,
        StatusId: 4,
      },
    },
  })
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "discard-2",
    fixtureId: 42,
    eventType: "action_discarded",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: { Action: "action_discarded", Id: 1, Seq: 2, StatusId: 4 },
    },
  })
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "unreliable-cards-3",
    fixtureId: 42,
    eventType: "unreliable_yellow_cards",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: {
        Action: "unreliable_yellow_cards",
        Id: 3,
        Seq: 3,
        StatusId: 4,
        Data: { Unreliable: true },
      },
    },
  })
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "card-4",
    fixtureId: 42,
    eventType: "red_card",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: {
        Action: "red_card",
        Id: 4,
        Seq: 4,
        Confirmed: true,
        StatusId: 4,
      },
    },
  })

  expect(await t.query(api.fixture_timeline.list, { fixtureId: 42 })).toEqual(
    []
  )
})

test("ignores a stale discard after a newer action is reconciled", async () => {
  const t = convexTest(schema, modules)

  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "card-5",
    fixtureId: 42,
    eventType: "yellow_card",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: {
        Action: "yellow_card",
        Id: 1,
        Seq: 5,
        Confirmed: true,
        StatusId: 4,
      },
    },
  })
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "discard-4",
    fixtureId: 42,
    eventType: "action_discarded",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: { Action: "action_discarded", Id: 1, Seq: 4, StatusId: 4 },
    },
  })

  expect(await t.query(api.fixture_timeline.list, { fixtureId: 42 })).toEqual([
    expect.objectContaining({ actionId: 1, type: "card", retracted: false }),
  ])
})
