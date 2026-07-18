import type { GenericDatabaseWriter } from "convex/server"

import type { Id } from "./_generated/dataModel"
import type { MatchFlashDataModel } from "./schema"

export async function recordTrophyEligibility(
  db: GenericDatabaseWriter<MatchFlashDataModel>,
  userId: Id<"users">,
  fixtureId: number,
  eligibleAt: number
) {
  const existing = await db
    .query("trophyEligibility")
    .withIndex("by_userId_and_fixtureId", (query) =>
      query.eq("userId", userId).eq("fixtureId", fixtureId)
    )
    .unique()

  if (!existing) {
    await db.insert("trophyEligibility", {
      userId,
      fixtureId,
      eligibleAt,
      claimStatus: "unclaimed",
    })
  }
}
