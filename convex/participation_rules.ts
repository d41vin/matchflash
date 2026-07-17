export const fixturePhases = ["upcoming", "live", "final", "replay"] as const

export type FixturePhase = (typeof fixturePhases)[number]

export const reactionTypes = ["cheer", "wow", "nervous"] as const

export type ReactionType = (typeof reactionTypes)[number]

export function isLiveFixturePhase(phase: FixturePhase) {
  return phase === "live"
}

export function isSupportedReaction(reaction: string): reaction is ReactionType {
  return (reactionTypes as readonly string[]).includes(reaction)
}
