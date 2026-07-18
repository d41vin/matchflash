/// <reference types="vite/client" />

import { convexTest } from "convex-test"
import { makeFunctionReference } from "convex/server"
import { expect, test } from "vitest"

import { internal } from "./_generated/api"
import type { Id } from "./_generated/dataModel"
import schema from "./schema"

const modules = import.meta.glob("./**/*.ts")

const createRoom = makeFunctionReference<
  "mutation",
  { fixtureId: number; kind: "public" | "private"; name: string },
  { roomId: Id<"rooms"> }
>("rooms:create")
const joinRoom = makeFunctionReference<
  "mutation",
  { roomId: Id<"rooms"> },
  null
>("rooms:join")
const sendMessage = makeFunctionReference<
  "mutation",
  { roomId: Id<"rooms">; body: string },
  null
>("chat:send")
const listMessages = makeFunctionReference<
  "query",
  { roomId: Id<"rooms"> },
  Array<{ author: { displayName: string }; body: string }>
>("chat:list")

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
    Update: { Action: "standby", Id: 1, Seq: 1, StatusId: 4 },
  },
}

async function roomWithMember() {
  const t = convexTest(schema, modules)
  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42",
  })
  const host = t.withIdentity({
    subject: "HostWallet11111111111111111111111111111111111",
    tokenIdentifier: "customJwt|HostWallet11111111111111111111111111111111111",
  })
  const room = await host.mutation(createRoom, {
    fixtureId: 42,
    kind: "public",
    name: "Northshore fans",
  })
  return { host, room, t }
}

test("a Room member can send and read their Room chat messages", async () => {
  const { host, room } = await roomWithMember()

  await host.mutation(sendMessage, {
    roomId: room.roomId,
    body: "  What a save!  ",
  })

  await expect(
    host.query(listMessages, { roomId: room.roomId })
  ).resolves.toMatchObject([
    { author: { displayName: "Fan 1111" }, body: "What a save!" },
  ])
})

test("Room chat rejects sends from non-members and excessive sends", async () => {
  const { host, room, t } = await roomWithMember()
  const visitor = t.withIdentity({
    subject: "VisitorWallet111111111111111111111111111111111",
    tokenIdentifier: "customJwt|VisitorWallet111111111111111111111111111111111",
  })

  await expect(
    visitor.mutation(sendMessage, { roomId: room.roomId, body: "Let me in" })
  ).rejects.toThrow("Join this Room")

  for (let messageNumber = 1; messageNumber <= 5; messageNumber += 1) {
    await host.mutation(sendMessage, {
      roomId: room.roomId,
      body: `Message ${messageNumber}`,
    })
  }

  await expect(
    host.mutation(sendMessage, { roomId: room.roomId, body: "One too many" })
  ).rejects.toThrow("slow down")
})

test("frozen Rooms reject new chat messages", async () => {
  const { host, room, t } = await roomWithMember()
  await host.mutation(sendMessage, { roomId: room.roomId, body: "Still here" })

  await t.mutation(internal.ingestion.captureRawEvent, {
    ...fixtureCapture,
    sourceEventId: "fixture-42-final",
    raw: {
      ...fixtureCapture.raw,
      Update: { Action: "status", Id: 2, Seq: 2, StatusId: 5 },
    },
  })

  await expect(
    host.mutation(sendMessage, { roomId: room.roomId, body: "Full time" })
  ).rejects.toThrow("read-only")
  await expect(
    host.query(listMessages, { roomId: room.roomId })
  ).resolves.toMatchObject([{ body: "Still here" }])
})

test("Room chat history is limited to the latest fifty messages", async () => {
  const { host, room, t } = await roomWithMember()
  const user = await t.run(async (ctx) => {
    return await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (query) =>
        query.eq(
          "tokenIdentifier",
          "customJwt|HostWallet11111111111111111111111111111111111"
        )
      )
      .unique()
  })
  if (!user) throw new Error("Expected the Room host to have a user profile.")

  await t.run(async (ctx) => {
    for (let messageNumber = 1; messageNumber <= 51; messageNumber += 1) {
      await ctx.db.insert("chatMessages", {
        roomId: room.roomId,
        userId: user._id,
        body: `Message ${messageNumber}`,
        createdAt: messageNumber,
      })
    }
  })

  const messages = await host.query(listMessages, { roomId: room.roomId })
  expect(messages).toHaveLength(50)
  expect(messages[0]).toMatchObject({ body: "Message 2" })
  expect(messages[49]).toMatchObject({ body: "Message 51" })
})
