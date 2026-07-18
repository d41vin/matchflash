/** The only fixture-shaped contract that anonymous UI may consume. */
export type MatchStatus = "upcoming" | "live" | "final"

export type FixtureRoomSource = {
  fixtureId: number
  competition: string
  stage: string
  participant1: string
  participant2: string
  startsAt: string
  state: {
    phase: MatchStatus
    statusId?: number
    minute?: number
    score1: number
    score2: number
    reliability: {
      cornersReliable: boolean
      cardsReliable: boolean
      dataSuspended: boolean
      periodSuspectSinceAdjustment?: boolean
    }
    heat?: number
    heatUpdatedAt?: number
    possession?: {
      team: 1 | 2
      intensity: "safe" | "attack" | "danger" | "highDanger"
      since: number
    }
    winProb1?: number
    drawProb?: number
    winProb2?: number
    oddsProvenance?: {
      bookmaker: string
      bookmakerId: number
      superOddsType: string
      marketPeriod?: string
      asOfTs: number
    }
    updatedAt: number
  }
  rawProviderPayload?: unknown
}

export type MatchRoomProjection = {
  fixtureId: number
  competition: string
  stage: string
  participant1: string
  participant2: string
  startsAt: string
  matchRoomHref: string
  room: {
    kind: "global"
    name: "Match Room"
  }
  match: {
    status: MatchStatus
    statusLabel: string
    minute?: number
    score1: number
    score2: number
  }
  feed: {
    updatedAt: number
    health: "current" | "stale"
    reliability: FixtureRoomSource["state"]["reliability"]
  }
  heat: {
    value: number
    updatedAt: number
  }
  field: {
    possession?: FixtureRoomSource["state"]["possession"]
  }
  odds:
    | { availability: "unavailable" }
    | {
        availability: "available"
        home: number
        draw: number
        away: number
        provenance: NonNullable<FixtureRoomSource["state"]["oddsProvenance"]>
      }
}

export type ConfirmedOddsRow = {
  bookmaker: string
  bookmakerId: number
  superOddsType: string
  marketPeriod?: string
}

const FEED_STALE_AFTER_MS = 90_000

function statusLabel(state: FixtureRoomSource["state"], startsAt: string) {
  if (state.phase === "live") {
    return state.minute === undefined ? "LIVE" : `LIVE · ${state.minute}′`
  }

  if (state.phase === "final") {
    return "FULL TIME"
  }

  const kickoff = new Date(startsAt)
  return `KICKOFF · ${kickoff.getUTCHours().toString().padStart(2, "0")}:${kickoff
    .getUTCMinutes()
    .toString()
    .padStart(2, "0")} UTC`
}

export function projectMatchRoom(
  source: FixtureRoomSource,
  now = source.state.updatedAt,
  confirmedOddsRow?: ConfirmedOddsRow
): MatchRoomProjection {
  const {
    fixtureId,
    competition,
    stage,
    participant1,
    participant2,
    startsAt,
    state,
  } = source

  return {
    fixtureId,
    competition,
    stage,
    participant1,
    participant2,
    startsAt,
    matchRoomHref: `/match/${fixtureId}`,
    room: {
      kind: "global",
      name: "Match Room",
    },
    match: {
      status: state.phase,
      statusLabel: statusLabel(state, startsAt),
      minute: state.minute,
      score1: state.score1,
      score2: state.score2,
    },
    feed: {
      updatedAt: state.updatedAt,
      health:
        now - state.updatedAt >= FEED_STALE_AFTER_MS ? "stale" : "current",
      reliability: state.reliability,
    },
    heat: {
      value: state.heat ?? 0,
      updatedAt: state.heatUpdatedAt ?? state.updatedAt,
    },
    field: {
      ...(state.possession ? { possession: state.possession } : {}),
    },
    odds:
      state.winProb1 !== undefined &&
      state.drawProb !== undefined &&
      state.winProb2 !== undefined &&
      state.oddsProvenance &&
      confirmedOddsRow &&
      state.oddsProvenance.bookmaker === confirmedOddsRow.bookmaker &&
      state.oddsProvenance.bookmakerId === confirmedOddsRow.bookmakerId &&
      state.oddsProvenance.superOddsType === confirmedOddsRow.superOddsType &&
      state.oddsProvenance.marketPeriod === confirmedOddsRow.marketPeriod
        ? {
            availability: "available",
            home: state.winProb1,
            draw: state.drawProb,
            away: state.winProb2,
            provenance: state.oddsProvenance,
          }
        : { availability: "unavailable" },
  }
}
