export type OddsTaxonomy = {
  fixtureId: number
  bookmaker: string
  bookmakerId: number
  superOddsType: string
  marketPeriod?: string
  inRunning: boolean
}

export type StablePriceOdds = OddsTaxonomy & {
  asOfTs: number
  home: number
  draw: number
  away: number
}

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function finiteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0
    ? value
    : undefined
}

function stringArray(value: unknown): string[] | undefined {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : undefined
}

function probability(value: string | undefined): number | undefined {
  if (!value || value.trim().toUpperCase() === "NA") return undefined
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100
    ? parsed
    : undefined
}

function outcomeProbability(
  priceNames: string[],
  percentages: string[],
  labels: readonly string[]
): number | undefined {
  const index = priceNames.findIndex((name) =>
    labels.some((label) => label.toLowerCase() === name.toLowerCase())
  )
  return index === -1 ? undefined : probability(percentages[index])
}

/** Extracts only the provider fields needed to catalogue an observed odds row. */
export function observedOddsTaxonomy(raw: unknown): OddsTaxonomy | null {
  if (!isObject(raw)) return null

  const fixtureId = finiteNumber(raw.FixtureId)
  const bookmaker = nonEmptyString(raw.Bookmaker)
  const bookmakerId = finiteNumber(raw.BookmakerId)
  const superOddsType = nonEmptyString(raw.SuperOddsType)
  const marketPeriod = raw.MarketPeriod
  const inRunning = raw.InRunning

  if (
    fixtureId === undefined ||
    !bookmaker ||
    bookmakerId === undefined ||
    !superOddsType ||
    typeof inRunning !== "boolean" ||
    (marketPeriod !== undefined && typeof marketPeriod !== "string")
  ) {
    return null
  }

  return {
    fixtureId,
    bookmaker,
    bookmakerId,
    superOddsType,
    ...(marketPeriod ? { marketPeriod } : {}),
    inRunning,
  }
}

/**
 * Normalizes the only odds shape MatchFlash can present: a complete 1X2
 * probability row. Unknown labels or malformed percentages are not guessed.
 */
export function normalizeStablePriceOdds(raw: unknown): StablePriceOdds | null {
  const taxonomy = observedOddsTaxonomy(raw)
  if (!taxonomy || !isObject(raw)) return null

  const asOfTs = finiteNumber(raw.Ts)
  const priceNames = stringArray(raw.PriceNames)
  const percentages = stringArray(raw.Pct)
  if (asOfTs === undefined || !priceNames || !percentages) return null

  const home = outcomeProbability(priceNames, percentages, [
    "Home",
    "1",
    "Participant1",
  ])
  const draw = outcomeProbability(priceNames, percentages, ["Draw", "X"])
  const away = outcomeProbability(priceNames, percentages, [
    "Away",
    "2",
    "Participant2",
  ])
  if (home === undefined || draw === undefined || away === undefined)
    return null

  return { ...taxonomy, asOfTs, home, draw, away }
}

export function taxonomyKey(
  taxonomy: Omit<OddsTaxonomy, "fixtureId" | "inRunning">
) {
  return JSON.stringify([
    taxonomy.bookmaker,
    taxonomy.bookmakerId,
    taxonomy.superOddsType,
    taxonomy.marketPeriod ?? null,
  ])
}

export function matchesConfirmedStablePriceRow(
  odds: OddsTaxonomy,
  confirmed: Omit<OddsTaxonomy, "fixtureId" | "inRunning">
) {
  return (
    odds.bookmaker === confirmed.bookmaker &&
    odds.bookmakerId === confirmed.bookmakerId &&
    odds.superOddsType === confirmed.superOddsType &&
    odds.marketPeriod === confirmed.marketPeriod
  )
}
