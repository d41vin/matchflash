import type {
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server"
import { v } from "convex/values"

import {
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import type { Id } from "./_generated/dataModel"
import type { MatchFlashDataModel } from "./schema"

const HISTORY_LIMIT = 50
const MESSAGE_MAX_LENGTH = 500
const RATE_LIMIT_COUNT = 5
const RATE_LIMIT_WINDOW_MS = 10_000

function database(
  ctx: MutationCtx
): GenericDatabaseWriter<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseWriter<MatchFlashDataModel>
}

function reader(ctx: QueryCtx): GenericDatabaseReader<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseReader<MatchFlashDataModel>
}

async function authenticatedMember(
  ctx: MutationCtx | QueryCtx,
  db: GenericDatabaseReader<MatchFlashDataModel>,
  roomId: Id<"rooms">
) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Sign in to use Room chat.")

  const user = await db
    .query("users")
    .withIndex("by_tokenIdentifier", (query) =>
      query.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique()
  const membership = user
    ? await db
        .query("roomMembers")
        .withIndex("by_roomId_and_userId", (query) =>
          query.eq("roomId", roomId).eq("userId", user._id)
        )
        .unique()
    : null
  if (!user || !membership) throw new Error("Join this Room before chatting.")

  return user
}

async function activeRoom(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  roomId: Id<"rooms">
) {
  const room = await db.get("rooms", roomId)
  if (!room) throw new Error("Room not found.")
  const fixtureState = await db
    .query("fixtureStates")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", room.fixtureId))
    .unique()
  if (room.frozen || fixtureState?.phase === "final") {
    throw new Error("This Room is read-only because the fixture has finished.")
  }
  return room
}

export const list = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const room = await db.get("rooms", args.roomId)
    if (!room) throw new Error("Room not found.")
    await authenticatedMember(ctx, db, args.roomId)

    const messages = await db
      .query("chatMessages")
      .withIndex("by_roomId_and_createdAt", (query) =>
        query.eq("roomId", args.roomId)
      )
      .order("desc")
      .take(HISTORY_LIMIT)

    const chronologicalMessages = messages.reverse()
    const rows = []
    for (const message of chronologicalMessages) {
      const user = await db.get("users", message.userId)
      if (user) {
        rows.push({
          _id: message._id,
          author: {
            displayName: user.displayName,
            avatarColor: user.avatarColor,
          },
          body: message.body,
          createdAt: message.createdAt,
        })
      }
    }
    return rows
  },
})

export const send = mutation({
  args: { roomId: v.id("rooms"), body: v.string() },
  handler: async (ctx, args) => {
    const db = database(ctx)
    const body = args.body.trim()
    if (body.length === 0 || body.length > MESSAGE_MAX_LENGTH) {
      throw new Error(`Messages must be 1 to ${MESSAGE_MAX_LENGTH} characters.`)
    }

    await activeRoom(db, args.roomId)
    const user = await authenticatedMember(ctx, db, args.roomId)
    const now = Date.now()
    const recentMessages = await db
      .query("chatMessages")
      .withIndex("by_roomId_and_userId_and_createdAt", (query) =>
        query.eq("roomId", args.roomId).eq("userId", user._id)
      )
      .order("desc")
      .take(RATE_LIMIT_COUNT)
    const oldestRecentMessage = recentMessages.at(-1)
    if (
      recentMessages.length === RATE_LIMIT_COUNT &&
      oldestRecentMessage &&
      oldestRecentMessage.createdAt > now - RATE_LIMIT_WINDOW_MS
    ) {
      throw new Error("You're sending messages too quickly. Please slow down.")
    }

    await db.insert("chatMessages", {
      roomId: args.roomId,
      userId: user._id,
      body,
      createdAt: now,
    })
    return null
  },
})
