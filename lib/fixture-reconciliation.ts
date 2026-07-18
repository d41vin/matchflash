export type FixtureMetadata = {
  fixtureId: number
  competition: string
  stage: string
  participant1: string
  participant2: string
  startsAt: string
}

export type ReliabilityState = {
  cornersReliable: boolean
  cardsReliable: boolean
  dataSuspended: boolean
  periodSuspectSinceAdjustment?: boolean
}

export type ReconciledMatchState = {
  fixtureId: number
  phase: "upcoming" | "live" | "final"
  statusId?: number
  score1: number
  score2: number
  reliability: ReliabilityState
  lastScoreSeq?: number
  heat?: number
  heatUpdatedAt?: number
  lastActivityHeatUpdateAt?: number
  lastPossessionHeatUpdateAt?: number
  pendingPossessionTicks?: number
  possession?: {
    team: 1 | 2
    intensity: "safe" | "attack" | "danger" | "highDanger"
    since: number
  }
  updatedAt: number
}

export type FixtureAction = {
  fixtureId: number
  actionId: number
  action: string
  sequence?: number
  discarded: boolean
}

export const FIXTURE_FEED_STALE_AFTER_MS = 90_000

export type FeedHealth = { kind: "current" } | { kind: "stale" }

export type ReconciledFixture = {
  fixture?: FixtureMetadata
  state: ReconciledMatchState
  action?: FixtureAction
}

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function objectAt(value: JsonObject | undefined, key: string) {
  const candidate = value?.[key]
  return isObject(candidate) ? candidate : undefined
}

function numberAt(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function stringAt(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function booleanAt(value: unknown) {
  return typeof value === "boolean" ? value : undefined
}

function fixtureFrom(
  fixtureInfo: JsonObject | undefined,
  fallback: FixtureMetadata | undefined
): FixtureMetadata | undefined {
  const fixtureId = numberAt(fixtureInfo?.FixtureId) ?? fallback?.fixtureId
  const competition =
    stringAt(fixtureInfo?.Competition) ?? fallback?.competition
  const stage = stringAt(fixtureInfo?.FixtureGroup) ?? fallback?.stage
  const participant1 =
    stringAt(fixtureInfo?.Participant1) ?? fallback?.participant1
  const participant2 =
    stringAt(fixtureInfo?.Participant2) ?? fallback?.participant2
  const startsAt = stringAt(fixtureInfo?.StartTime) ?? fallback?.startsAt

  if (
    fixtureId === undefined ||
    !competition ||
    !stage ||
    !participant1 ||
    !participant2 ||
    !startsAt
  ) {
    return undefined
  }

  return { fixtureId, competition, stage, participant1, participant2, startsAt }
}

function scoreForParticipant(value: unknown) {
  const participant = isObject(value) ? value : undefined
  const total = objectAt(participant, "Total")
  return numberAt(total?.Goals) ?? numberAt(participant?.Goals)
}

function scoresFrom(update: JsonObject) {
  const score =
    objectAt(update, "Score") ?? objectAt(objectAt(update, "Data"), "Score")
  const score1 = scoreForParticipant(score?.Participant1)
  const score2 = scoreForParticipant(score?.Participant2)
  return score1 === undefined || score2 === undefined
    ? undefined
    : { score1, score2 }
}

function phaseForStatus(
  statusId: number | undefined
): ReconciledMatchState["phase"] {
  if (statusId === 1 || statusId === undefined) {
    return "upcoming"
  }

  if ([5, 10, 13, 15, 16, 17].includes(statusId)) {
    return "final"
  }

  return "live"
}

function initialReliability(): ReliabilityState {
  return {
    cornersReliable: true,
    cardsReliable: true,
    dataSuspended: false,
  }
}

export function feedHealthFor(updatedAt: number, now: number): FeedHealth {
  return now - updatedAt >= FIXTURE_FEED_STALE_AFTER_MS
    ? { kind: "stale" }
    : { kind: "current" }
}

function nextReliability(
  current: ReliabilityState,
  action: string,
  data: JsonObject | undefined,
  statusId: number | undefined
): ReliabilityState {
  const reliability = { ...current }

  if (statusId === 18) {
    // TXCS is an explicit provider coverage suspension. Keep the scoreboard
    // available but make its degraded status visible to every viewer.
    reliability.dataSuspended = true
  } else if (action === "score_adjustment") {
    reliability.periodSuspectSinceAdjustment = true
  } else if (action === "halftime_finalised") {
    delete reliability.periodSuspectSinceAdjustment
  } else if (action === "suspend") {
    const reliable = booleanAt(data?.Reliable)
    if (reliable !== undefined) {
      reliability.dataSuspended = !reliable
    }
  } else if (action === "unreliable_corners") {
    const unreliable = booleanAt(data?.Unreliable)
    if (unreliable !== undefined) {
      reliability.cornersReliable = !unreliable
    }
  } else if (action === "unreliable_yellow_cards") {
    const unreliable = booleanAt(data?.Unreliable)
    if (unreliable !== undefined) {
      reliability.cardsReliable = !unreliable
    }
  }

  return reliability
}

function possessionIntensity(action: string, rawIntensity: unknown) {
  if (action === "safe_possession") return "safe" as const
  if (action === "attack_possession") return "attack" as const
  if (action === "danger_possession") return "danger" as const
  if (action === "high_danger_possession") return "highDanger" as const

  switch (rawIntensity) {
    case "SafePossession":
      return "safe" as const
    case "AttackPossession":
      return "attack" as const
    case "DangerPossession":
      return "danger" as const
    case "HighDangerPossession":
      return "highDanger" as const
    default:
      return undefined
  }
}

function nextPossession(
  current: ReconciledMatchState["possession"],
  update: JsonObject,
  data: JsonObject | undefined,
  action: string,
  capturedAt: number
): ReconciledMatchState["possession"] {
  const intensity = possessionIntensity(
    action,
    update.PossessionType ?? data?.PossessionType
  )
  const team = numberAt(
    update.Participant ??
      data?.Participant ??
      update.Possession ??
      data?.Possession
  )
  if (!intensity || (team !== 1 && team !== 2)) return current

  return { team: team as 1 | 2, intensity, since: capturedAt }
}

/**
 * Reconciles one persisted TxLINE source envelope into the safe, fixture-level
 * state that the UI may consume. Raw provider payloads intentionally stay out
 * of its return value.
 */
export function reconcileFixtureEvent(
  current: Pick<ReconciledFixture, "fixture" | "state"> | undefined,
  raw: unknown,
  capturedAt: number
): ReconciledFixture | null {
  if (!isObject(raw)) {
    return null
  }

  const fixtureInfo = objectAt(raw, "FixtureInfo")
  const update = objectAt(raw, "Update")
  if (!update) {
    return null
  }

  const fixtureId =
    numberAt(update.FixtureId) ??
    numberAt(fixtureInfo?.FixtureId) ??
    current?.state.fixtureId
  if (fixtureId === undefined) {
    return null
  }

  const fixture = fixtureFrom(fixtureInfo, current?.fixture)
  const action = stringAt(update.Action)?.toLowerCase() ?? "message"
  const data = objectAt(update, "Data")
  const statusId = numberAt(update.StatusId) ?? numberAt(data?.StatusId)
  const sequence = numberAt(update.Seq)
  const currentState = current?.state
  const isOlderThanProjection =
    currentState?.lastScoreSeq !== undefined &&
    sequence !== undefined &&
    sequence < currentState.lastScoreSeq

  const base: ReconciledMatchState = currentState ?? {
    fixtureId,
    phase: phaseForStatus(statusId),
    score1: 0,
    score2: 0,
    reliability: initialReliability(),
    updatedAt: capturedAt,
  }

  const state: ReconciledMatchState = isOlderThanProjection
    ? base
    : {
        ...base,
        fixtureId,
        // An Action Amend carries the status of the historical action being
        // changed, not the fixture's current phase.
        ...(statusId !== undefined && action !== "action_amend"
          ? { statusId, phase: phaseForStatus(statusId) }
          : {}),
        ...(scoresFrom(update) ?? {}),
        reliability: nextReliability(base.reliability, action, data, statusId),
        ...(() => {
          const possession = nextPossession(
            base.possession,
            update,
            data,
            action,
            capturedAt
          )
          return possession ? { possession } : {}
        })(),
        ...(sequence !== undefined ? { lastScoreSeq: sequence } : {}),
        updatedAt: capturedAt,
      }

  const amendTargetId =
    action === "action_amend" ? numberAt(data?.Id) : undefined
  const actionId = amendTargetId ?? numberAt(update.Id)
  const actionName =
    action === "action_amend"
      ? (stringAt(data?.Action)?.toLowerCase() ?? "unknown")
      : action

  return {
    ...(fixture ? { fixture } : {}),
    state,
    ...(actionId !== undefined
      ? {
          action: {
            fixtureId,
            actionId,
            action: actionName,
            ...(sequence !== undefined ? { sequence } : {}),
            discarded: action === "action_discarded",
          },
        }
      : {}),
  }
}
