/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { makeFunctionReference } from "convex/server"
import { expect, test } from "vitest"

import { api, internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")

const listRooms = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{
    fixtureId: number
    kind: "global" | "public" | "private"
    name: string
    frozen: boolean
  }>
>("rooms:list")
const myRooms = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{
    _id: Id<"rooms">
    kind: "global" | "public" | "private"
    name: string
    frozen: boolean
  }>
>("rooms:mine")

const createRoom = makeFunctionReference<
  "mutation",
  { fixtureId: number; kind: "public" | "private"; name: string },
  { roomId: Id<"rooms"> }
>("rooms:create")
const standings = makeFunctionReference<
  "query",
  { roomId: Id<"rooms"> },
  Array<{ displayName: string; score: number }>
>("rooms:standings")
const joinRoom = makeFunctionReference<
  "mutation",
  { roomId: Id<"rooms"> },
  null
>("rooms:join")
const recordRoomReaction = makeFunctionReference<
  "mutation",
  {
    roomId: Id<"rooms">
    flashCardId: Id<"flashCards">
    reaction: "cheer" | "wow" | "nervous"
  },
  { reactionId: Id<"roomReactions"> }
>("rooms:recordReaction")
const reactionSummary = makeFunctionReference<
  "query",
  { roomId: Id<"rooms">; flashCardId: Id<"flashCards"> },
  { cheer: number; wow: number; nervous: number }
>("rooms:reactionSummary")
const matchStandings = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{ displayName: string; score: number }>
>("rooms:matchStandings")

const fixtureCapture = {
  source: "scores" as const,
  fixtureId: 42,
  eventType: "standby",
  raw: {
    FixtureInfo: {
      FixtureId: 42,
      Competition: "World Cup 2026",
      FixtureGroup: "World Cup > Final",
      Participant1: "Northshore",
      Participant2: "Southport",
      StartTime: "2026-07-19T19:00:00.000Z",
    },
    Update: { Action: "standby", Id: 1, Seq: 1, StatusId: 3 },
  },
}

test("creates one anonymous global Match Room when a fixture is projected", async () => {
  const t = convexTest(schema, modules)

  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42",
  })

  await t.mutation(internal.ingestion.captureRawEvent, {
    source: "scores",
    sourceEventId: "fixture-42-replay",
    fixtureId: 42,
    eventType: "standby",
    raw: {
      FixtureInfo: {
        FixtureId: 42,
        Competition: "World Cup 2026",
        FixtureGroup: "World Cup > Final",
        Participant1: "Northshore",
        Participant2: "Southport",
        StartTime: "2026-07-19T19:00:00.000Z",
      },
      Update: { Action: "standby", Id: 2, Seq: 2, StatusId: 3 },
    },
  })

  await expect(t.query(listRooms, { fixtureId: 42 })).resolves.toEqual([
    expect.objectContaining({
      fixtureId: 42,
      kind: "global",
      name: "Match Room",
      frozen: false,
    }),
  ])
})

test("an authenticated fan creates one public Room and begins its standings", async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42",
  })

  const fan = t.withIdentity({
    subject: "WalletPublicKey1111111111111111111111111111111",
    tokenIdentifier: "customJwt|WalletPublicKey1111111111111111111111111111111",
  })
  const room = await fan.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })

  await expect(t.query(listRooms, { fixtureId: 42 })).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        _id: room.roomId,
        kind: "public",
        name: "Northshore fans",
        frozen: false,
      }),
    ])
  )
  await expect(fan.query(standings, { roomId: room.roomId })).resolves.toEqual([
    { displayName: "Fan 1111", score: 0 },
  ])
  await expect(fan.query(myRooms, { fixtureId: 42 })).resolves.toEqual([
    expect.objectContaining({
      _id: room.roomId,
      kind: "public",
      name: "Northshore fans",
      frozen: false,
    }),
  ])
})

test("a Room member reacts to a fixture Flash Card without changing that shared record", async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42-live",
    raw: {
      ...fixtureCapture.raw,
      Update: { Action: "standby", Id: 1, Seq: 1, StatusId: 4 },
    },
  })
  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "card-42",
    eventType: "yellow_card",
    raw: {
      ...fixtureCapture.raw,
      Update: {
        Action: "yellow_card",
        Id: 2,
        Seq: 2,
        Confirmed: true,
        StatusId: 4,
      },
    },
  })
  const [flashCard] = await t.query(api.fixture_timeline.list, {
    fixtureId: 42,
  })
  expect(flashCard).toMatchObject({ type: "card", retracted: false })

  const host = t.withIdentity({
    subject: "HostWallet11111111111111111111111111111111111",
    tokenIdentifier: "customJwt|HostWallet11111111111111111111111111111111111",
  })
  const guest = t.withIdentity({
    subject: "GuestWallet1111111111111111111111111111111111",
    tokenIdentifier: "customJwt|GuestWallet1111111111111111111111111111111111",
  })
  const room = await host.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await guest.mutation(joinRoom, { roomId: room.roomId })
  await guest.mutation(recordRoomReaction, {
    roomId: room.roomId,
    flashCardId: flashCard._id,
    reaction: "cheer",
  })

  await expect(
    t.query(reactionSummary, {
      roomId: room.roomId,
      flashCardId: flashCard._id,
    })
  ).resolves.toEqual({ cheer: 1, wow: 0, nervous: 0 })
  await expect(
    t.query(api.fixture_timeline.list, { fixtureId: 42 })
  ).resolves.toEqual([
    expect.objectContaining({ _id: flashCard._id, retracted: false }),
  ])
})

test("match standings combine members across the fixture's social Rooms", async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42",
  })
  const host = t.withIdentity({
    subject: "HostWallet11111111111111111111111111111111111",
    tokenIdentifier: "customJwt|HostWallet11111111111111111111111111111111111",
  })
  const guest = t.withIdentity({
    subject: "GuestWallet1111111111111111111111111111111111",
    tokenIdentifier: "customJwt|GuestWallet1111111111111111111111111111111111",
  })
  const room = await host.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await guest.mutation(joinRoom, { roomId: room.roomId })

  await expect(t.query(matchStandings, { fixtureId: 42 })).resolves.toEqual([
    { displayName: "Fan 1111", score: 0 },
    { displayName: "Fan 1111", score: 0 },
  ])
})

test("final fixtures make every Room read-only and reject new social Rooms", async () => {
  const t = convexTest(schema, modules)
  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42-live",
    raw: {
      ...fixtureCapture.raw,
      Update: { Action: "standby", Id: 1, Seq: 1, StatusId: 4 },
    },
  })
  const host = t.withIdentity({
    subject: "HostWallet11111111111111111111111111111111111",
    tokenIdentifier: "customJwt|HostWallet11111111111111111111111111111111111",
  })
  const guest = t.withIdentity({
    subject: "GuestWallet1111111111111111111111111111111111",
    tokenIdentifier: "customJwt|GuestWallet1111111111111111111111111111111111",
  })
  const room = await host.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  await guest.mutation(joinRoom, { roomId: room.roomId })
  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42-final",
    raw: {
      ...fixtureCapture.raw,
      Update: { Action: "status", Id: 2, Seq: 2, StatusId: 5 },
    },
  })

  await expect(t.query(listRooms, { fixtureId: 42 })).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ _id: room.roomId, frozen: true }),
    ])
  )
  await expect(
    guest.mutation(joinRoom, { roomId: room.roomId })
  ).rejects.toThrow("read-only")
  await expect(
    host.mutation(createRoom, {
      fixtureId: 42,
      kind: "private",
      name: "Final whistle",
    })
  ).rejects.toThrow("cannot be created")
})
