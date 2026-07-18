import { v } from "convex/values"

import {
  projectMatchRoom,
  type ConfirmedOddsRow,
  type FixtureRoomSource,
} from "../lib/match-room-projection"
import { query, type QueryCtx } from "./_generated/server"
import type { MatchFlashDataModel } from "./schema"
import type { GenericDatabaseReader } from "convex/server"

function reader(ctx: QueryCtx): GenericDatabaseReader<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseReader<MatchFlashDataModel>
}

function toProjection(
  source: FixtureRoomSource,
  now: number,
  confirmedOddsRow?: ConfirmedOddsRow
) {
  return projectMatchRoom(source, now, confirmedOddsRow)
}

async function confirmedOddsRow(
  db: GenericDatabaseReader<MatchFlashDataModel>
) {
  const row = await db
    .query("oddsCanonicalRows")
    .withIndex("by_key", (query) => query.eq("key", "stablePrice"))
    .unique()
  if (!row) return undefined
  return {
    bookmaker: row.bookmaker,
    bookmakerId: row.bookmakerId,
    superOddsType: row.superOddsType,
    ...(row.marketPeriod ? { marketPeriod: row.marketPeriod } : {}),
  }
}

export const list = query({
  args: { now: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const states = await db.query("matchStates").order("desc").take(200)
    const now = args.now ?? Date.now()
    const oddsRow = await confirmedOddsRow(db)
    const projections = []

    for (const state of states) {
      const fixture = await db
        .query("fixtures")
        .withIndex("by_fixtureId", (query) =>
          query.eq("fixtureId", state.fixtureId)
        )
        .unique()
      if (!fixture) {
        continue
      }
      projections.push(toProjection({ ...fixture, state }, now, oddsRow))
    }

    return projections
  },
})

export const get = query({
  args: { fixtureId: v.number(), now: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const db = reader(ctx)
    const fixture = await db
      .query("fixtures")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .unique()
    const state = await db
      .query("matchStates")
      .withIndex("by_fixtureId", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .unique()

    if (!fixture || !state) {
      return null
    }

    return toProjection(
      { ...fixture, state },
      args.now ?? Date.now(),
      await confirmedOddsRow(db)
    )
  },
})
