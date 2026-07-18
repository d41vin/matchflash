export type PhaseOneFieldEvent = {
  type: "goal" | "card" | "corner" | "varReview" | "varResolved" | "phaseChange"
  participant?: 1 | 2
}

export type FieldReaction = {
  label: string
  zone: "goal" | "center" | "corner" | "border"
  team?: 1 | 2
}

/**
 * A classified moment maps to a semantic field zone, never a source coordinate.
 */
export function fieldReactionFor(
  event: PhaseOneFieldEvent
): FieldReaction | null {
  switch (event.type) {
    case "goal":
      return { label: "Goal moment", zone: "goal", team: event.participant }
    case "card":
      return { label: "Card moment", zone: "center", team: event.participant }
    case "corner":
      return { label: "Corner moment", zone: "corner", team: event.participant }
    case "varReview":
      return { label: "VAR review", zone: "border" }
    case "varResolved":
      return { label: "VAR decision", zone: "border" }
    case "phaseChange":
      return null
  }
}
