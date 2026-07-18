import type { GenericDatabaseWriter } from "convex/server"

import { decayedHeat } from "../lib/heat"
import { internalMutation, type MutationCtx } from "./_generated/server"
import type { MatchFlashDataModel } from "./schema"

function database(
  ctx: MutationCtx
): GenericDatabaseWriter<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseWriter<MatchFlashDataModel>
}

/** Persists quiet-match Heat decay; public queries only ever read it. */
export const decayLiveHeat = internalMutation({
  args: {},
  handler: async (ctx) => {
    const db = database(ctx)
    const now = Date.now()
    const liveStates = await db
      .query("matchStates")
      .withIndex("by_phase", (query) => query.eq("phase", "live"))
      .take(200)

    for (const state of liveStates) {
      if (state.heat === undefined || state.heatUpdatedAt === undefined) {
        continue
      }
      await db.patch(state._id, {
        heat: decayedHeat(
          { heat: state.heat, heatUpdatedAt: state.heatUpdatedAt },
          now
        ),
        heatUpdatedAt: now,
      })
    }
  },
})
