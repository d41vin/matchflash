export const HALF_LIFE_MINUTES = 6
export const ACTIVITY_THROTTLE_MS = 20_000
export const POSSESSION_THROTTLE_MS = 20_000

const MAX_FLASH_CONTRIBUTION = 25
const FLASH_CONTRIBUTION_SCALE = 0.3
const MAX_ACTIVITY_CONTRIBUTION = 15
const ACTIVITY_SCALE = 0.5
const MAX_POSSESSION_CONTRIBUTION = 10
const POSSESSION_SCALE = 2

export type HeatState = {
  heat: number
  heatUpdatedAt: number
}

function decayFactor(elapsedMs: number) {
  return Math.pow(0.5, elapsedMs / 60_000 / HALF_LIFE_MINUTES)
}

export function decayedHeat(state: HeatState, now: number) {
  return state.heat * decayFactor(Math.max(0, now - state.heatUpdatedAt))
}

export function applyFlashContribution(
  state: HeatState,
  impactScore: number,
  now: number
): HeatState {
  return {
    heat:
      decayedHeat(state, now) +
      Math.min(
        Math.max(impactScore, 0) * FLASH_CONTRIBUTION_SCALE,
        MAX_FLASH_CONTRIBUTION
      ),
    heatUpdatedAt: now,
  }
}

export function shouldApplyActivityContribution(state: HeatState, now: number) {
  return now - state.heatUpdatedAt >= ACTIVITY_THROTTLE_MS
}

export function applyActivityContribution(
  state: HeatState,
  recentActivityCount: number,
  now: number
): HeatState {
  return {
    heat:
      decayedHeat(state, now) +
      Math.min(
        Math.max(recentActivityCount, 0) * ACTIVITY_SCALE,
        MAX_ACTIVITY_CONTRIBUTION
      ),
    heatUpdatedAt: now,
  }
}

export function shouldApplyPossessionContribution(
  lastPossessionUpdateAt: number,
  now: number
) {
  return now - lastPossessionUpdateAt >= POSSESSION_THROTTLE_MS
}

export function applyPossessionContribution(
  state: HeatState,
  sustainedIntensityTicks: number,
  now: number
): HeatState {
  return {
    heat:
      decayedHeat(state, now) +
      Math.min(
        Math.max(sustainedIntensityTicks, 0) * POSSESSION_SCALE,
        MAX_POSSESSION_CONTRIBUTION
      ),
    heatUpdatedAt: now,
  }
}

export function heatForDisplay(heat: number, max = 100) {
  return Math.max(0, Math.min(Math.round(heat), max))
}
