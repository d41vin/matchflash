/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { makeFunctionReference } from "convex/server"
import { expect, test } from "vitest"

import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")

const listPrompts = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{
    _id: Id<"predictionPrompts">
    template: "nextGoal" | "penaltyOutcome"
    options: Array<{ id: string; label: string }>
    status: "open" | "locked" | "settled" | "voided"
  }>
>("predictions:list")
const answerPrompt = makeFunctionReference<
  "mutation",
  { promptId: Id<"predictionPrompts">; roomId: Id<"rooms">; optionId: string },
  { predictionId: Id<"predictions"> }
>("predictions:answer")
const dataQualityNotes = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{ message: string }>
>("predictions:dataQualityNotes")
const createRoom = makeFunctionReference<
  "mutation",
  { fixtureId: number; kind: "public" | "private"; name: string },
  { roomId: Id<"rooms"> }
>("rooms:create")
const roomStandings = makeFunctionReference<
  "query",
  { roomId: Id<"rooms"> },
  Array<{ displayName: string; score: number }>
>("rooms:standings")

const fixtureInfo = {
  FixtureId: 42,
  Competition: "World Cup 2026",
  FixtureGroup: "World Cup > Final",
  Participant1: "Northshore",
  Participant2: "Southport",
  StartTime: "2026-07-19T19:00:00.000Z",
}

const fanIdentity = {
  subject: "PredictionFan11111111111111111111111111111111",
  tokenIdentifier: "customJwt|PredictionFan11111111111111111111111111111111",
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

test("a next-goal prompt is canonical across Rooms, settles once, and awards one point", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "kickoff-1", "kickoff", 1)

  const [prompt] = await t.query(listPrompts, { fixtureId: 42 })
  expect(prompt).toMatchObject({
    template: "nextGoal",
    status: "open",
    options: [
      { id: "participant1", label: "Northshore" },
      { id: "participant2", label: "Southport" },
      { id: "noFurtherGoals", label: "No further goals" },
    ],
  })

  const fan = t.withIdentity(fanIdentity)
  const room = await fan.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await fan.mutation(answerPrompt, {
    promptId: prompt._id,
    roomId: room.roomId,
    optionId: "participant1",
  })
  await expect(
    fan.mutation(answerPrompt, {
      promptId: prompt._id,
      roomId: room.roomId,
      optionId: "participant2",
    })
  ).rejects.toThrow("already answered")

  await capture(t, "goal-2", "goal", 2, { Participant: 1 })
  await expect(
    fan.query(roomStandings, { roomId: room.roomId })
  ).resolves.toEqual([{ displayName: "Fan 1111", score: 1 }])
  await expect(t.query(listPrompts, { fixtureId: 42 })).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ _id: prompt._id, status: "settled" }),
      expect.objectContaining({ template: "nextGoal", status: "open" }),
    ])
  )
})

test("a penalty prompt remains open for a retake before settling", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "penalty-1", "penalty", 1, { Participant: 1 })
  const [prompt] = await t.query(listPrompts, { fixtureId: 42 })
  expect(prompt).toMatchObject({ template: "penaltyOutcome", status: "open" })

  const fan = t.withIdentity(fanIdentity)
  const room = await fan.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await fan.mutation(answerPrompt, {
    promptId: prompt._id,
    roomId: room.roomId,
    optionId: "scored",
  })
  await capture(t, "penalty-outcome-2", "penalty_outcome", 2, {
    Participant: 1,
    FollowsAction: 1,
    Data: { Outcome: "Retake" },
  })
  await expect(t.query(listPrompts, { fixtureId: 42 })).resolves.toEqual([
    expect.objectContaining({ _id: prompt._id, status: "open" }),
  ])

  await capture(t, "penalty-outcome-3", "penalty_outcome", 3, {
    Participant: 1,
    FollowsAction: 1,
    Data: { Outcome: "Scored" },
  })
  await expect(
    fan.query(roomStandings, { roomId: room.roomId })
  ).resolves.toEqual([{ displayName: "Fan 1111", score: 1 }])
})

test("a clear discarded goal voids the settled prompt and removes its point", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "kickoff-1", "kickoff", 1)
  const [prompt] = await t.query(listPrompts, { fixtureId: 42 })
  const fan = t.withIdentity(fanIdentity)
  const room = await fan.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await fan.mutation(answerPrompt, {
    promptId: prompt._id,
    roomId: room.roomId,
    optionId: "participant1",
  })
  await capture(t, "goal-2", "goal", 2, { Participant: 1 })
  await capture(t, "discard-3", "action_discarded", 2)

  await expect(
    fan.query(roomStandings, { roomId: room.roomId })
  ).resolves.toEqual([{ displayName: "Fan 1111", score: 0 }])
  await expect(t.query(listPrompts, { fixtureId: 42 })).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ _id: prompt._id, status: "voided" }),
    ])
  )
  await expect(t.query(dataQualityNotes, { fixtureId: 42 })).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ message: expect.stringContaining("voided") }),
    ])
  )
})

test("full time settles an unanswered next-goal prompt as no further goals", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "kickoff-1", "kickoff", 1)
  const [prompt] = await t.query(listPrompts, { fixtureId: 42 })
  const fan = t.withIdentity(fanIdentity)
  const room = await fan.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await fan.mutation(answerPrompt, {
    promptId: prompt._id,
    roomId: room.roomId,
    optionId: "noFurtherGoals",
  })
  await capture(t, "final-2", "status", 2, { StatusId: 5 })

  await expect(
    fan.query(roomStandings, { roomId: room.roomId })
  ).resolves.toEqual([{ displayName: "Fan 1111", score: 1 }])
})

test("an amendment that changes a settled penalty outcome voids its result", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "penalty-1", "penalty", 1, { Participant: 1 })
  const [prompt] = await t.query(listPrompts, { fixtureId: 42 })
  const fan = t.withIdentity(fanIdentity)
  const room = await fan.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await fan.mutation(answerPrompt, {
    promptId: prompt._id,
    roomId: room.roomId,
    optionId: "scored",
  })
  await capture(t, "penalty-outcome-2", "penalty_outcome", 2, {
    Participant: 1,
    FollowsAction: 1,
    Data: { Outcome: "Scored" },
  })
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "penalty-amend-3",
    fixtureId: 42,
    eventType: "action_amend",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: {
        Action: "action_amend",
        Id: 3,
        Seq: 3,
        StatusId: 4,
        Data: {
          Action: "penalty_outcome",
          Id: 2,
          Participant: 1,
          New: { Outcome: "Missed" },
        },
      },
    },
  })

  await expect(
    fan.query(roomStandings, { roomId: room.roomId })
  ).resolves.toEqual([{ displayName: "Fan 1111", score: 0 }])
  await expect(t.query(listPrompts, { fixtureId: 42 })).resolves.toEqual([
    expect.objectContaining({ _id: prompt._id, status: "voided" }),
  ])
})

test("an amendment that changes the scoring team voids the next-goal result", async () => {
  const t = convexTest(schema, modules)
  await capture(t, "kickoff-1", "kickoff", 1)
  const [prompt] = await t.query(listPrompts, { fixtureId: 42 })
  const fan = t.withIdentity(fanIdentity)
  const room = await fan.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await fan.mutation(answerPrompt, {
    promptId: prompt._id,
    roomId: room.roomId,
    optionId: "participant1",
  })
  await capture(t, "goal-2", "goal", 2, { Participant: 1 })
  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "goal-amend-3",
    fixtureId: 42,
    eventType: "action_amend",
    raw: {
      FixtureInfo: fixtureInfo,
      Update: {
        Action: "action_amend",
        Id: 3,
        Seq: 3,
        StatusId: 4,
        Data: {
          Action: "goal",
          Id: 2,
          Participant: 2,
          New: { Participant: 2 },
        },
      },
    },
  })

  await expect(
    fan.query(roomStandings, { roomId: room.roomId })
  ).resolves.toEqual([{ displayName: "Fan 1111", score: 0 }])
  await expect(t.query(listPrompts, { fixtureId: 42 })).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ _id: prompt._id, status: "voided" }),
    ])
  )
})
