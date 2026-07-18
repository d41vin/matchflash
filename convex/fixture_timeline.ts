import { v } from "convex/values"

import { query } from "./_generated/server"

/** The public, correction-aware fixture timeline for live and replay clients. */
export const list = query({
  args: { fixtureId: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("flashCards")
      .withIndex("by_fixtureId_and_retracted", (query) =>
        query.eq("fixtureId", args.fixtureId).eq("retracted", false)
      )
      .order("asc")
      .take(500)
  },
})
