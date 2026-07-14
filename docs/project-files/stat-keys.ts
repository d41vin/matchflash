/**
 * Reference implementation — TxLINE soccer stat keys.
 *
 * Confirmed against TxLINE's soccer feed on-chain spec, and re-confirmed
 * against a full read of the live soccer feed documentation — unchanged
 * from the original pass; nothing found contradicts it. Do NOT source stat
 * keys from github.com/txodds/tx-on-chain — that repo's worked examples and
 * tables are for US College Football and Basketball and use a different
 * numbering entirely.
 */

export const BASE_STAT_KEY = {
  participant1Goals: 1,
  participant2Goals: 2,
  participant1YellowCards: 3,
  participant2YellowCards: 4,
  participant1RedCards: 5,
  participant2RedCards: 6,
  participant1Corners: 7,
  participant2Corners: 8,
} as const

export type BaseStatName = keyof typeof BASE_STAT_KEY

export const PERIOD_OFFSET = {
  fullMatch: 0,
  firstHalf: 1000,
  secondHalf: 2000,
  firstExtraTime: 3000,
  secondExtraTime: 4000,
  penalties: 5000,
} as const

export type Period = keyof typeof PERIOD_OFFSET

/**
 * statKey = period_offset + base_key
 * Example: getStatKey("participant2Goals", "firstHalf") === 1002
 */
export function getStatKey(
  stat: BaseStatName,
  period: Period = "fullMatch"
): number {
  return PERIOD_OFFSET[period] + BASE_STAT_KEY[stat]
}

/** Reverse lookup, mostly useful for logging/debugging a raw statKey value. */
export function describeStatKey(
  statKey: number
): { stat: BaseStatName; period: Period } | null {
  const periodEntries = Object.entries(PERIOD_OFFSET) as [Period, number][]
  const period = periodEntries
    .sort((a, b) => b[1] - a[1])
    .find(([, offset]) => statKey >= offset)?.[0]
  if (!period) return null

  const base = statKey - PERIOD_OFFSET[period]
  const statEntry = (
    Object.entries(BASE_STAT_KEY) as [BaseStatName, number][]
  ).find(([, key]) => key === base)
  if (!statEntry) return null

  return { stat: statEntry[0], period }
}

/**
 * Builds the query string for GET /api/scores/stat-validation.
 * statKey2 is optional — pass it to prove two stats together in one call,
 * e.g. the predicate-based comparisons the on-chain validator supports —
 * see docs/01-txline-integration-reference.md §6.
 */
export function buildStatValidationQuery(params: {
  fixtureId: number
  seq: number
  statKey: number
  statKey2?: number
}): string {
  const q = new URLSearchParams({
    fixtureId: String(params.fixtureId),
    seq: String(params.seq),
    statKey: String(params.statKey),
  })
  if (params.statKey2 !== undefined) {
    q.set("statKey2", String(params.statKey2))
  }
  return q.toString()
}

// ---- Worked examples, for sanity-checking your own usage -----------------
//
// getStatKey("participant1Goals")                      -> 1     (full match)
// getStatKey("participant2Goals", "firstHalf")          -> 1002
// getStatKey("participant1YellowCards", "secondHalf")   -> 2003
// getStatKey("participant2RedCards", "penalties")       -> 5006
// describeStatKey(1002)  -> { stat: "participant2Goals", period: "firstHalf" }
