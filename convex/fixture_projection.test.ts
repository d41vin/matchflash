/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { makeFunctionReference } from "convex/server"
import { expect, test, vi } from "vitest"

import { internal } from "./_generated/api"
import { api } from "./_generated/api"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")
const decayLiveHeat = makeFunctionReference<
  "mutation",
  Record<string, never>,
  null
>("heat:decayLiveHeat")

test("stores a score adjustment once and exposes only its safe fixture projection", async () => {
  const t = convexTest(schema, modules)

  const outcome = await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "score-18",
    fixtureId: 42,
    eventType: "score_adjustment",
    sequence: 18,
    occurredAt: 1_784_390_400_000,
    raw: {
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
        StatusId: 4,
        Score: {
          Participant1: { Total: { Goals: 2 } },
          Participant2: { Total: { Goals: 1 } },
        },
      },
    },
  })

  expect(outcome).toEqual({ stored: true })
  expect(
    await t.mutation(internal.ingestion.captureRawEvent, {
      source: "scores",
      sourceEventId: "score-18",
      fixtureId: 42,
      eventType: "score_adjustment",
      sequence: 18,
      occurredAt: 1_784_390_400_000,
      raw: {},
    })
  ).toEqual({ stored: false })

  const projection = await t.query(api.fixture_projection.get, {
    fixtureId: 42,
    now: 1_784_390_401_000,
  })

  expect(projection).toMatchObject({
    fixtureId: 42,
    competition: "World Cup 2026",
    participant1: "Northshore",
    participant2: "Southport",
    match: { status: "live", score1: 2, score2: 1 },
    feed: {
      health: "current",
      reliability: {
        cornersReliable: true,
        cardsReliable: true,
        dataSuspended: false,
        periodSuspectSinceAdjustment: true,
      },
    },
  })
  expect(projection).not.toHaveProperty("raw")
})

test("projects stored Heat and possession intensity without exposing source payloads", async () => {
  vi.useFakeTimers()
  try {
    const t = convexTest(schema, modules)
    vi.setSystemTime(0)
    await t.mutation(internal.ingestion.captureRawEvent, {
      source: "scores",
      sourceEventId: "pressure-1",
      fixtureId: 42,
      eventType: "danger_possession",
      raw: {
        FixtureInfo: {
          FixtureId: 42,
          Competition: "World Cup 2026",
          FixtureGroup: "World Cup > Final",
          Participant1: "Northshore",
          Participant2: "Southport",
          StartTime: "2026-07-19T19:00:00.000Z",
        },
        Update: {
          Action: "danger_possession",
          Id: 1,
          Seq: 1,
          StatusId: 4,
          Participant: 1,
          Confirmed: true,
        },
      },
    })
    vi.setSystemTime(1_000)
    await t.mutation(internal.ingestion.captureRawEvent, {
      source: "scores",
      sourceEventId: "card-2",
      fixtureId: 42,
      eventType: "yellow_card",
      raw: {
        FixtureInfo: {
          FixtureId: 42,
          Competition: "World Cup 2026",
          FixtureGroup: "World Cup > Final",
          Participant1: "Northshore",
          Participant2: "Southport",
          StartTime: "2026-07-19T19:00:00.000Z",
        },
        Update: {
          Action: "yellow_card",
          Id: 2,
          Seq: 2,
          StatusId: 4,
          Participant: 2,
          Confirmed: true,
        },
      },
    })

    const projection = await t.query(api.fixture_projection.get, {
      fixtureId: 42,
      now: 1_000,
    })

    expect(projection).toMatchObject({
      heat: { updatedAt: 1_000 },
      field: {
        possession: { team: 1, intensity: "danger", since: 0 },
      },
    })
    expect(projection?.heat.value).toBeCloseTo(7.996152, 5)

    vi.setSystemTime(361_000)
    await t.mutation(decayLiveHeat, {})
    const decayedProjection = await t.query(api.fixture_projection.get, {
      fixtureId: 42,
      now: 361_000,
    })
    expect(decayedProjection?.heat).toMatchObject({ updatedAt: 361_000 })
    expect(decayedProjection?.heat.value).toBeCloseTo(3.998076, 5)
  } finally {
    vi.useRealTimers()
  }
})
