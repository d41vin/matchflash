import type {
  GenericDatabaseReader,
  GenericDatabaseWriter,
} from "convex/server"
import { v } from "convex/values"

import {
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server"
import type { MatchFlashDataModel } from "./schema"
import { reconcileCapturedScoreEvent } from "./reconciliation"
import { reconcileCapturedOddsEvent } from "./odds"

export const sourceValidator = v.union(v.literal("scores"), v.literal("odds"))

export type TxlineSource = "scores" | "odds"

export type RawCaptureArgs = {
  source: TxlineSource
  sourceEventId: string
  sseEventId?: string
  fixtureId?: number
  eventType: string
  sequence?: number
  occurredAt?: number
  raw: unknown
}

function writer(ctx: MutationCtx): GenericDatabaseWriter<MatchFlashDataModel> {
  // Generated bindings are refreshed by `npx convex dev` after deployment.
  // Keep this pre-deploy schema boundary typed in the meantime.
  return ctx.db as unknown as GenericDatabaseWriter<MatchFlashDataModel>
}

function reader(ctx: QueryCtx): GenericDatabaseReader<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseReader<MatchFlashDataModel>
}

async function checkpoint(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  source: TxlineSource,
  lastEventId: string,
  updatedAt: number
) {
  const existing = await db
    .query("txlineStreamCheckpoints")
    .withIndex("by_source", (query) => query.eq("source", source))
    .unique()

  if (existing) {
    await db.patch(existing._id, { lastEventId, updatedAt })
    return
  }

  await db.insert("txlineStreamCheckpoints", { source, lastEventId, updatedAt })
}

// Called with Convex admin authentication by the operator-owned worker. It is
// intentionally internal: neither a browser nor a public app route can write
// provider data.
export const captureRawEvent = internalMutation({
  args: {
    source: sourceValidator,
    sourceEventId: v.string(),
    sseEventId: v.optional(v.string()),
    fixtureId: v.optional(v.number()),
    eventType: v.string(),
    sequence: v.optional(v.number()),
    occurredAt: v.optional(v.number()),
    raw: v.any(),
  },
  handler: async (ctx, args) => {
    const db = writer(ctx)
    const existing = await db
      .query("txlineEvents")
      .withIndex("by_source_and_sourceEventId", (query) =>
        query.eq("source", args.source).eq("sourceEventId", args.sourceEventId)
      )
      .unique()

    const capturedAt = Date.now()
    if (args.sseEventId) {
      await checkpoint(db, args.source, args.sseEventId, capturedAt)
    }

    if (existing) {
      return { stored: false }
    }

    await db.insert("txlineEvents", { ...args, capturedAt })
    if (args.source === "scores") {
      await reconcileCapturedScoreEvent(db, args.raw, capturedAt)
    } else {
      await reconcileCapturedOddsEvent(
        db,
        args.raw,
        args.sourceEventId,
        capturedAt
      )
    }
    return { stored: true }
  },
})

export const getResumeCheckpoint = internalQuery({
  args: { source: sourceValidator },
  handler: async (ctx, args) => {
    const checkpoint = await reader(ctx)
      .query("txlineStreamCheckpoints")
      .withIndex("by_source", (query) => query.eq("source", args.source))
      .unique()

    return checkpoint?.lastEventId ?? null
  },
})

// Replay remains a local-per-viewer concern in a later ticket. This bounded,
// internal input is deliberately raw and makes no TxLINE request.
export const listReplayCapture = internalQuery({
  args: {
    fixtureId: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(Math.max(args.limit ?? 500, 1), 1_000)
    return await reader(ctx)
      .query("txlineEvents")
      .withIndex("by_fixtureId_and_capturedAt", (query) =>
        query.eq("fixtureId", args.fixtureId)
      )
      .order("asc")
      .take(limit)
  },
})
