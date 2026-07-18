import type { GenericDatabaseWriter } from "convex/server"

import { applyFlashContribution, decayedHeat } from "../lib/heat"
import { internalMutation, type MutationCtx } from "./_generated/server"
import type { MatchFlashDataModel } from "./schema"

type HeatUpdate = { heat: number }

export function peakHeatPatch(
  currentPeak: number | undefined,
  heat: HeatUpdate,
  updatedAt: number
) {
  return currentPeak === undefined || heat.heat > currentPeak
    ? { peakHeat: heat.heat, peakHeatUpdatedAt: updatedAt }
    : {}
}

function database(
  ctx: MutationCtx
): GenericDatabaseWriter<MatchFlashDataModel> {
  return ctx.db as unknown as GenericDatabaseWriter<MatchFlashDataModel>
}

/** Applies the shared Heat contribution whenever a confirmed Flash Card exists. */
export async function applyFlashHeat(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  fixtureId: number,
  impactScore: number,
  capturedAt: number
) {
  const state = await db
    .query("matchStates")
    .withIndex("by_fixtureId", (query) => query.eq("fixtureId", fixtureId))
    .unique()
  if (!state) return

  const heat = applyFlashContribution(
    {
      heat: state.heat ?? 0,
      heatUpdatedAt: state.heatUpdatedAt ?? capturedAt,
    },
    impactScore,
    capturedAt
  )
  await db.patch(state._id, {
    ...heat,
    ...peakHeatPatch(state.peakHeat, heat, capturedAt),
  })
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
