/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { expect, test } from "vitest"

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

const fanIdentity = {
  subject: "RecapFan1111111111111111111111111111111111111",
  tokenIdentifier: "customJwt|RecapFan1111111111111111111111111111111111111",
}

async function capture(
  t: ReturnType<typeof convexTest>,
  sourceEventId: string,
  action: string,
  id: number,
  extra: Record<string, unknown> = {}
) {
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
        ...extra,
      },
    },
  })
}

test("a finished receipt is public while prediction results and eligibility stay participant-only", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "kickoff-1", "kickoff", 1)
  const [prompt] = await t.query(api.predictions.list, { fixtureId: 42 })
  const fan = t.withIdentity(fanIdentity)
  const room = await fan.mutation(api.rooms.create, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })

  await fan.mutation(api.predictions.answer, {
    promptId: prompt._id,
    roomId: room.roomId,
    optionId: "participant1",
  })
  await capture(t, "goal-2", "goal", 2, { Participant: 1 })
  await capture(t, "discard-3", "action_discarded", 2)
  await capture(t, "final-4", "status", 4, { StatusId: 5 })

  await expect(t.query(api.recaps.get, { fixtureId: 42 })).resolves.toMatchObject({
    shared: {
      score1: 0,
      score2: 0,
      dataQualityNotes: [expect.stringContaining("voided")],
    },
    participant: null,
  })
  await expect(fan.query(api.recaps.get, { fixtureId: 42 })).resolves.toMatchObject({
    participant: {
      eligibility: { claimStatus: "unclaimed" },
      predictions: [expect.objectContaining({ result: "void" })],
      matchStanding: { score: 0, rank: 1 },
    },
  })
  await expect(fan.query(api.recaps.history, {})).resolves.toMatchObject([
    { fixtureId: 42, href: "/match/42" },
  ])
})

test("a cleared reliability flag remains visible in the finished receipt", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "score-adjustment-1", "score_adjustment", 1)
  await capture(t, "halftime-2", "halftime_finalised", 2)
  await capture(t, "final-3", "status", 3, { StatusId: 5 })

  await expect(t.query(api.recaps.get, { fixtureId: 42 })).resolves.toMatchObject({
    shared: {
      dataQualityNotes: [
        "Some match data was flagged as unreliable during play.",
      ],
    },
  })
})
