/**
 * Reference implementation — odds normalization.
 *
 * Payload shape confirmed accurate against TxLINE's live OpenAPI spec —
 * field names, types, and structure all check out exactly as originally
 * assumed. What's new: TxODDS brands their consensus pricing engine
 * "StablePrice" — a de-margined aggregate across bookmakers. The canonical
 * row CANONICAL_BOOKMAKER should filter for is very likely a Bookmaker
 * value referencing this consensus line directly, rather than an arbitrary
 * real bookmaker chosen as a stand-in for consensus. This is a strong
 * hypothesis now, not a blind guess — but still confirm it the first time
 * discoverOddsTaxonomy() runs against a live fixture before shipping.
 */

// ---- Raw payload shape, as documented ----------------------------------

export interface RawOddsPayload {
  FixtureId: number
  MessageId: string
  Ts: number
  Bookmaker: string
  BookmakerId: number
  SuperOddsType: string
  GameState?: string
  InRunning: boolean
  MarketParameters?: string
  MarketPeriod?: string
  PriceNames: string[]
  Prices: number[]
  /** Strings formatted to 3 decimal places, e.g. "52.632", or "NA" for quarter-handicap lines. */
  Pct: string[]
}

// ---- Normalized shape your pipeline actually wants ----------------------

export interface NormalizedOdds {
  fixtureId: number
  asOfTs: number
  bookmaker: string
  superOddsType: string
  marketPeriod?: string
  inRunning: boolean
  home: number | null
  draw: number | null
  away: number | null
}

// ---- Fill these in after running discoverOddsTaxonomy() -----------------
// PLACEHOLDERS until confirmed against a live stream. Strong hypothesis
// noted below — not a blind guess, but not yet verified either.

export const CANONICAL_MARKET = {
  /** e.g. "MatchOdds" or "1X2" — replace after discovery */
  superOddsType: "REPLACE_ME_MATCH_WINNER_MARKET",
  marketPeriod: undefined as string | undefined,
}

export const CANONICAL_BOOKMAKER = {
  /**
   * Very likely something referencing "StablePrice" — TxODDS's own
   * de-margined consensus line, per their odds overview documentation.
   * Confirm the exact string via discoverOddsTaxonomy() before shipping;
   * don't guess a real bookmaker name as a fallback until you've actually
   * checked whether a StablePrice-branded row exists in the live stream.
   */
  name: "REPLACE_ME_CONSENSUS_BOOKMAKER",
}

const HOME_LABELS = ["Home", "1", "Participant1"]
const DRAW_LABELS = ["Draw", "X"]
const AWAY_LABELS = ["Away", "2", "Participant2"]

// ---- Core parsing ---------------------------------------------------------

export function parsePct(value: string | undefined): number | null {
  if (value === undefined) return null
  if (value.trim().toUpperCase() === "NA") return null
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? n : null
}

function findByLabels(
  names: string[],
  pcts: (number | null)[],
  labels: string[]
): number | null {
  const idx = names.findIndex((n) =>
    labels.some((l) => l.toLowerCase() === n.toLowerCase())
  )
  return idx === -1 ? null : pcts[idx]
}

export function isCanonicalMatchWinnerRow(payload: RawOddsPayload): boolean {
  const marketMatches = payload.SuperOddsType === CANONICAL_MARKET.superOddsType
  const periodMatches =
    CANONICAL_MARKET.marketPeriod === undefined ||
    payload.MarketPeriod === CANONICAL_MARKET.marketPeriod
  const bookmakerMatches = payload.Bookmaker === CANONICAL_BOOKMAKER.name
  return marketMatches && periodMatches && bookmakerMatches
}

export function normalizeOdds(payload: RawOddsPayload): NormalizedOdds {
  const pcts = payload.Pct.map(parsePct)
  return {
    fixtureId: payload.FixtureId,
    asOfTs: payload.Ts,
    bookmaker: payload.Bookmaker,
    superOddsType: payload.SuperOddsType,
    marketPeriod: payload.MarketPeriod,
    inRunning: payload.InRunning,
    home: findByLabels(payload.PriceNames, pcts, HOME_LABELS),
    draw: findByLabels(payload.PriceNames, pcts, DRAW_LABELS),
    away: findByLabels(payload.PriceNames, pcts, AWAY_LABELS),
  }
}

export function normalizeIfCanonical(
  payload: RawOddsPayload
): NormalizedOdds | null {
  if (!isCanonicalMatchWinnerRow(payload)) return null
  return normalizeOdds(payload)
}

// ---- Discovery script ------------------------------------------------------
// Run against a real fixture (live, or devnet/replay) before filling in
// CANONICAL_MARKET / CANONICAL_BOOKMAKER above.
//
//   npx tsx discover.ts
//
// Look specifically for a Bookmaker value that reads like TxODDS's own
// StablePrice consensus line before falling back to picking a real
// bookmaker as a stand-in.

export async function discoverOddsTaxonomy(
  streamUrl: string,
  headers: Record<string, string>,
  sampleSize = 200
): Promise<void> {
  const seen = new Map<string, number>()
  let count = 0

  const response = await fetch(streamUrl, { headers })
  if (!response.body) throw new Error("No response body — check auth headers.")

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (count < sampleSize) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const lines = buffer.split("\n")
    buffer = lines.pop() ?? ""

    for (const line of lines) {
      if (!line.startsWith("data:")) continue
      try {
        const payload = JSON.parse(
          line.slice(5).trim()
        ) as Partial<RawOddsPayload>
        if (!payload.SuperOddsType) continue
        const key = `${payload.SuperOddsType} | ${payload.MarketPeriod ?? "(no period)"} | ${payload.Bookmaker}`
        seen.set(key, (seen.get(key) ?? 0) + 1)
        count++
      } catch {
        // ignore heartbeats / malformed lines
      }
    }
  }

  console.log(
    `\nObserved ${count} odds messages. Distinct SuperOddsType | MarketPeriod | Bookmaker combos:\n`
  )
  for (const [key, n] of [...seen.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${n.toString().padStart(4)}  ${key}`)
  }
  console.log(
    "\nLook first for a row that reads like TxODDS's StablePrice consensus line, then update CANONICAL_MARKET / CANONICAL_BOOKMAKER above.\n"
  )
}
