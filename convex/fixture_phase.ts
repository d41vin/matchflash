import type { FixturePhase } from "./participation_rules"

// Ticket 01 intentionally ships this temporary local Match Room projection.
// Ticket 03 replaces it with the worker-owned fixtureStates record. This is a
// server-owned fallback, never a value the browser can supply.
const previewFixturePhases: Record<number, FixturePhase> = {
  1001: "live",
  1002: "upcoming",
  1003: "final",
}

export function effectiveFixturePhase(
  fixtureId: number,
  persistedPhase: FixturePhase | undefined
) {
  return persistedPhase ?? previewFixturePhases[fixtureId]
}
