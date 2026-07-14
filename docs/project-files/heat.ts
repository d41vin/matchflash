/**
 * Reference implementation — Heat calculation.
 *
 * Updated after a full read of the actual soccer feed spec. The core
 * decay-plus-contribution mechanism is unchanged — it was sound. What's new
 * is a third contribution path: sustained possession intensity, using the
 * dedicated possession-intensity events (safe/attack/danger/highDanger
 * possession), which turn out to be frequent and granular enough to be a
 * genuine "this match feels alive" signal even through a stretch with no
 * card-worthy discrete event — something the original design only gestured
 * at as a Phase 1.5 placeholder.
 *
 * Heat is the per-match number behind the Lobby's HeatBadge — genuinely
 * user-facing, unlike Impact Score, which is internal. Design goal
 * unchanged: cheap to read regardless of how many clients are watching.
 * matchStates.heat is a stored field, updated by a Convex mutation, never
 * recomputed inside a query.
 *
 *   newHeat = (oldHeat * decayFactor(elapsedMinutes)) + contribution
 *
 * Three things feed a Heat update:
 *
 * 1. A new confirmed Flash Card is created. Naturally rate-limited by
 *    construction.
 *
 * 2. Room activity (reactions + predictions), aggregated across every room
 *    tied to the fixture, never per-room — a small, very active private
 *    room shouldn't be able to swing a fixture-wide signal as much as the
 *    whole public crowd can. Throttled per fixture.
 *
 * 3. Sustained possession intensity (new). Uses the standalone
 *    danger_possession / high_danger_possession events directly, not just
 *    the field embedded on other actions. Same throttling discipline as
 *    room activity — this is frequent data and needs it.
 *
 * Deliberately excluded: weather, and any administrative/reliability signal
 * (connected/disconnected, suspend). Heat describes match excitement, not
 * data quality or ambient conditions — folding those in would blur two
 * things that should stay separate.
 */

export const HALF_LIFE_MINUTES = 6 // still a starting guess — tune once real matches are being watched
export const ACTIVITY_THROTTLE_MS = 20_000
export const POSSESSION_THROTTLE_MS = 20_000

const MAX_FLASH_CONTRIBUTION = 25
const FLASH_CONTRIBUTION_SCALE = 0.3

const MAX_ACTIVITY_CONTRIBUTION = 15
const ACTIVITY_SCALE = 0.5

const MAX_POSSESSION_CONTRIBUTION = 10
const POSSESSION_SCALE = 2 // per sustained high-danger/danger interval observed in the throttle window

export interface HeatState {
  heat: number
  heatUpdatedAt: number // ms epoch
}

function decayFactor(elapsedMs: number): number {
  const elapsedMinutes = elapsedMs / 60_000
  return Math.pow(0.5, elapsedMinutes / HALF_LIFE_MINUTES)
}

function applyDecay(state: HeatState, now: number): number {
  const elapsed = Math.max(0, now - state.heatUpdatedAt)
  return state.heat * decayFactor(elapsed)
}

/** Call from the same mutation that creates a confirmed Flash Card. Not throttled. */
export function applyFlashContribution(
  state: HeatState,
  impactScore: number,
  now: number
): HeatState {
  const contribution = Math.min(
    impactScore * FLASH_CONTRIBUTION_SCALE,
    MAX_FLASH_CONTRIBUTION
  )
  return { heat: applyDecay(state, now) + contribution, heatUpdatedAt: now }
}

export function shouldApplyActivityContribution(
  state: HeatState,
  now: number
): boolean {
  return now - state.heatUpdatedAt >= ACTIVITY_THROTTLE_MS
}

/**
 * recentActivityCount must already be summed across every room tied to the
 * fixture, not just one room — see the module doc above.
 */
export function applyActivityContribution(
  state: HeatState,
  recentActivityCount: number,
  now: number
): HeatState {
  const contribution = Math.min(
    recentActivityCount * ACTIVITY_SCALE,
    MAX_ACTIVITY_CONTRIBUTION
  )
  return { heat: applyDecay(state, now) + contribution, heatUpdatedAt: now }
}

export function shouldApplyPossessionContribution(
  lastPossessionUpdate: number,
  now: number
): boolean {
  return now - lastPossessionUpdate >= POSSESSION_THROTTLE_MS
}

/**
 * Call with a count of sustained danger/highDanger possession events
 * (either team) observed since the last possession-driven update — new
 * relative to the original design, made possible by how granular this
 * signal turns out to be in the real feed.
 */
export function applyPossessionContribution(
  state: HeatState,
  sustainedIntensityTicks: number,
  now: number
): HeatState {
  const contribution = Math.min(
    sustainedIntensityTicks * POSSESSION_SCALE,
    MAX_POSSESSION_CONTRIBUTION
  )
  return { heat: applyDecay(state, now) + contribution, heatUpdatedAt: now }
}

/**
 * Display helper: Heat is an unbounded, decaying accumulator — clamp it for
 * a badge/progress-bar-style UI.
 */
export function heatForDisplay(heat: number, max = 100): number {
  return Math.max(0, Math.min(Math.round(heat), max))
}
