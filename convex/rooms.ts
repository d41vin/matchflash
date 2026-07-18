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

const ROOM_NAME_MAX_LENGTH = 48
const REACTION_COLORS = ["cyan", "violet", "amber", "rose"]

function database(
  ctx: MutationCtx
): GenericDatabaseWriter<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseWriter<MatchFlashDataModel>
}

function reader(ctx: QueryCtx): GenericDatabaseReader<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseReader<MatchFlashDataModel>
}

function profileForWallet(walletAddress: string) {
  const suffix = walletAddress.slice(-4)
  const colorIndex =
    walletAddress
      .split("")
      .reduce((sum, character) => sum + character.charCodeAt(0), 0) %
    REACTION_COLORS.length

  return {
    displayName: `Fan ${suffix}`,
    avatarColor: REACTION_COLORS[colorIndex],
  }
}

async function currentUser(ctx: MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Sign in to join a Room.")

  const db = database(ctx)
  const existing = await db
    .query("users")
    .withIndex("by_tokenIdentifier", (query) =>
      query.eq("tokenIdentifier", identity.tokenIdentifier)
    )
    .unique()
  if (existing) return existing

  const userId = await db.insert("users", {
    authSubject: identity.subject,
    tokenIdentifier: identity.tokenIdentifier,
    walletAddress: identity.subject,
    ...profileForWallet(identity.subject),
    createdAt: Date.now(),
  })
  const user = await db.get(userId)
  if (!user) throw new Error("Unable to create the signed-in user.")
  return user
}

async function fixtureIsFrozen(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  fixtureId: number
) {
  const phase = await db
    .query("fixtureStates")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", fixtureId))
    .unique()
  return phase?.phase === "final"
}

async function requirePrivateRoomMembership(
  ctx: QueryCtx,
  db: GenericDatabaseReader<MatchFlashDataModel>,
  room: { _id: Id<"rooms">; kind: "global" | "public" | "private" }
) {
  if (room.kind !== "private") return
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error("Sign in to view this private Room.")
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
          query.eq("roomId", room._id).eq("userId", user._id)
        )
        .unique()
    : null
  if (!membership)
    throw new Error("Join this private Room to view its standings.")
}

async function requireActiveRoom(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  roomId: Id<"rooms">
) {
  const room = await db.get("rooms", roomId)
  if (!room) throw new Error("Room not found.")
  if (room.frozen || (await fixtureIsFrozen(db, room.fixtureId))) {
    throw new Error("This Room is read-only because the fixture has finished.")
  }
  return room
}

export async function ensureGlobalRoom(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  fixtureId: number,
  frozen: boolean,
  createdAt: number
) {
  const existing = await db
    .query("rooms")
    .withIndex("by_fixtureId_and_kind", (query) =>
      query.eq("fixtureId", fixtureId).eq("kind", "global")
    )
    .unique()
  if (existing) {
    if (frozen && !existing.frozen)
      await db.patch(existing._id, { frozen: true })
    return existing._id
  }
  return await db.insert("rooms", {
    fixtureId,
    kind: "global",
    name: "Match Room",
    createdAt,
    frozen,
  })
}

export const list = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const fixtureState = await db
      .query("fixtureStates")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .unique()
    const fixtureFrozen = fixtureState?.phase === "final"
    const rooms = await db
      .query("rooms")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .order("asc")
      .take(100)

    return rooms
      .filter((room) => room.kind !== "private")
      .map((room) => ({
        _id: room._id,
        fixtureId: room.fixtureId,
        kind: room.kind,
        name: room.name,
        frozen: room.frozen || fixtureFrozen,
      }))
  },
})

export const mine = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []

    const user = await db
      .query("users")
      .withIndex("by_tokenIdentifier", (query) =>
        query.eq("tokenIdentifier", identity.tokenIdentifier)
      )
      .unique()
    if (!user) return []

    const fixtureState = await db
      .query("fixtureStates")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .unique()
    const memberships = await db
      .query("roomMembers")
      .withIndex("by_fixtureId_and_userId", (query) =>
        query.eq("fixtureId", args.fixtureId).eq("userId", user._id)
      )
      .take(10)
    const rooms = []
    for (const membership of memberships) {
      const room = await db.get("rooms", membership.roomId)
      if (room && room.kind !== "global") {
        rooms.push({
          _id: room._id,
          kind: room.kind,
          name: room.name,
          frozen: room.frozen || fixtureState?.phase === "final",
        })
      }
    }
    return rooms
  },
})

export const create = mutation({
  args: {
    fixtureId: v.number(),
    kind: v.union(v.literal("public"), v.literal("private")),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const db = database(ctx)
    const name = args.name.trim()
    if (name.length === 0 || name.length > ROOM_NAME_MAX_LENGTH) {
      throw new Error(
        `Room names must be 1 to ${ROOM_NAME_MAX_LENGTH} characters.`
      )
    }

    const fixture = await db
      .query("fixtures")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .unique()
    if (!fixture) throw new Error("Fixture not found.")
    if (await fixtureIsFrozen(db, args.fixtureId)) {
      throw new Error("Rooms cannot be created after the fixture has finished.")
    }

    const user = await currentUser(ctx)
    const memberships = await db
      .query("roomMembers")
      .withIndex("by_fixtureId_and_userId", (query) =>
        query.eq("fixtureId", args.fixtureId).eq("userId", user._id)
      )
      .take(10)
    for (const membership of memberships) {
      const room = await db.get("rooms", membership.roomId)
      if (room?.kind === args.kind) {
        throw new Error(
          `You already have an active ${args.kind} Room for this fixture.`
        )
      }
    }

    const createdAt = Date.now()
    const roomId = await db.insert("rooms", {
      fixtureId: args.fixtureId,
      kind: args.kind,
      name,
      hostUserId: user._id,
      createdAt,
      frozen: false,
    })
    await db.insert("roomMembers", {
      roomId,
      fixtureId: args.fixtureId,
      userId: user._id,
      joinedAt: createdAt,
      score: 0,
    })
    return { roomId }
  },
})

export const join = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const db = database(ctx)
    const room = await requireActiveRoom(db, args.roomId)
    if (room.kind !== "public") {
      throw new Error("Private Rooms can only be joined by their host.")
    }

    const user = await currentUser(ctx)
    const existingMembership = await db
      .query("roomMembers")
      .withIndex("by_roomId_and_userId", (query) =>
        query.eq("roomId", room._id).eq("userId", user._id)
      )
      .unique()
    if (existingMembership) return null

    const memberships = await db
      .query("roomMembers")
      .withIndex("by_fixtureId_and_userId", (query) =>
        query.eq("fixtureId", room.fixtureId).eq("userId", user._id)
      )
      .take(10)
    for (const membership of memberships) {
      const joinedRoom = await db.get("rooms", membership.roomId)
      if (joinedRoom?.kind === "public") {
        throw new Error(
          "You already have an active public Room for this fixture."
        )
      }
    }

    await db.insert("roomMembers", {
      roomId: room._id,
      fixtureId: room.fixtureId,
      userId: user._id,
      joinedAt: Date.now(),
      score: 0,
    })
    return null
  },
})

export const recordReaction = mutation({
  args: {
    roomId: v.id("rooms"),
    flashCardId: v.id("flashCards"),
    reaction: v.union(
      v.literal("cheer"),
      v.literal("wow"),
      v.literal("nervous")
    ),
  },
  handler: async (ctx, args) => {
    const db = database(ctx)
    const room = await requireActiveRoom(db, args.roomId)
    const user = await currentUser(ctx)
    const membership = await db
      .query("roomMembers")
      .withIndex("by_roomId_and_userId", (query) =>
        query.eq("roomId", room._id).eq("userId", user._id)
      )
      .unique()
    if (!membership) {
      if (room.kind !== "global") {
        throw new Error("Join this Room before reacting.")
      }
      await db.insert("roomMembers", {
        roomId: room._id,
        fixtureId: room.fixtureId,
        userId: user._id,
        joinedAt: Date.now(),
        score: 0,
      })
    }

    const flashCard = await db.get("flashCards", args.flashCardId)
    if (
      !flashCard ||
      flashCard.fixtureId !== room.fixtureId ||
      flashCard.retracted
    ) {
      throw new Error("This Flash Card is not available in this Room.")
    }

    const reactionId = await db.insert("roomReactions", {
      fixtureId: room.fixtureId,
      flashCardId: flashCard._id,
      roomId: room._id,
      userId: user._id,
      reaction: args.reaction,
      createdAt: Date.now(),
    })
    return { reactionId }
  },
})

export const reactionSummary = query({
  args: { roomId: v.id("rooms"), flashCardId: v.id("flashCards") },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const room = await db.get("rooms", args.roomId)
    if (!room) throw new Error("Room not found.")
    await requirePrivateRoomMembership(ctx, db, room)
    const reactions = await db
      .query("roomReactions")
      .withIndex("by_roomId_and_flashCardId", (query) =>
        query.eq("roomId", args.roomId).eq("flashCardId", args.flashCardId)
      )
      .take(500)
    return reactions.reduce(
      (summary, reaction) => {
        summary[reaction.reaction] += 1
        return summary
      },
      { cheer: 0, wow: 0, nervous: 0 }
    )
  },
})

export const matchStandings = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const memberships = await db
      .query("roomMembers")
      .withIndex("by_fixtureId_and_userId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .take(500)
    const totals = new Map<string, { displayName: string; score: number }>()
    for (const membership of memberships) {
      const user = await db.get("users", membership.userId)
      if (!user) continue
      const existing = totals.get(user._id)
      if (existing) {
        existing.score += membership.score
      } else {
        totals.set(user._id, {
          displayName: user.displayName,
          score: membership.score,
        })
      }
    }
    return [...totals.values()].sort(
      (left, right) =>
        right.score - left.score ||
        left.displayName.localeCompare(right.displayName)
    )
  },
})

export const standings = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const room = await db.get("rooms", args.roomId)
    if (!room) throw new Error("Room not found.")
    await requirePrivateRoomMembership(ctx, db, room)

    const memberships = await db
      .query("roomMembers")
      .withIndex("by_roomId_and_score", (query) =>
        query.eq("roomId", args.roomId)
      )
      .order("desc")
      .take(100)
    const rows = []
    for (const membership of memberships) {
      const user = await db.get("users", membership.userId)
      if (user)
        rows.push({ displayName: user.displayName, score: membership.score })
    }
    return rows
  },
})
