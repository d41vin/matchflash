import type { MatchFlashDataModel } from "./schema"

export function reliabilityWasFlagged(
  reliability: MatchFlashDataModel["matchStates"]["document"]["reliability"]
) {
  return (
    !reliability.cornersReliable ||
    !reliability.cardsReliable ||
    reliability.dataSuspended ||
    reliability.periodSuspectSinceAdjustment === true
  )
}
