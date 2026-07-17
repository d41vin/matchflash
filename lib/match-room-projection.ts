/**
 * The only fixture-shaped contract that the anonymous UI may consume.
 *
 * Ingestion and reconciliation can change independently behind this boundary,
 * but raw TxLINE envelopes must never cross it into a browser-facing view.
 */
export type MatchStatus = "upcoming" | "live" | "final"

type FixtureRoomSource = {
  fixtureId: number
  competition: string
  stage: string
  participant1: string
  participant2: string
  startsAt: string
  state: {
    phase: MatchStatus
    minute?: number
    score1: number
    score2: number
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
}

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
  source: FixtureRoomSource
): MatchRoomProjection {
  const { fixtureId, competition, stage, participant1, participant2, startsAt, state } =
    source

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
  }
}

// The first ticket deliberately uses local preview fixtures. Ticket 03 replaces
// this source with the persistent worker while preserving this public contract.
const previewFixtures: FixtureRoomSource[] = [
  {
    fixtureId: 1001,
    competition: "World Cup 2026 · Preview",
    stage: "Match day",
    participant1: "North Coast",
    participant2: "South Shore",
    startsAt: "2026-07-18T18:00:00.000Z",
    state: { phase: "live", minute: 63, score1: 0, score2: 0 },
  },
  {
    fixtureId: 1002,
    competition: "World Cup 2026 · Preview",
    stage: "Match day",
    participant1: "East City",
    participant2: "West United",
    startsAt: "2026-07-18T21:00:00.000Z",
    state: { phase: "upcoming", score1: 0, score2: 0 },
  },
  {
    fixtureId: 1003,
    competition: "World Cup 2026 · Preview",
    stage: "Match day",
    participant1: "River Plate",
    participant2: "Mountain FC",
    startsAt: "2026-07-17T18:00:00.000Z",
    state: { phase: "final", score1: 1, score2: 1 },
  },
]

export function listLobbyFixtures(): MatchRoomProjection[] {
  return previewFixtures.map(projectMatchRoom)
}

export function getMatchRoomProjection(
  fixtureId: number
): MatchRoomProjection | null {
  const fixture = previewFixtures.find((entry) => entry.fixtureId === fixtureId)
  return fixture ? projectMatchRoom(fixture) : null
}
