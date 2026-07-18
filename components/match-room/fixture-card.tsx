"use client"

import Link from "next/link"

import type { MatchRoomProjection } from "@/lib/match-room-projection"

import {
  fixtureHasReliabilityWarning,
  useFixtureFeedHealth,
} from "./fixture-feed-notice"
import { HeatBadge } from "./heat-badge"

export function FixtureCard({ fixture }: { fixture: MatchRoomProjection }) {
  const health = useFixtureFeedHealth(fixture)
  const hasReliabilityWarning = fixtureHasReliabilityWarning(fixture)

  return (
    <Link
      aria-label={`Open Match Room: ${fixture.participant1} versus ${fixture.participant2}`}
      className="group block rounded-3xl border border-white/10 bg-slate-900 p-5 transition hover:border-cyan-300/60 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
      href={fixture.matchRoomHref}
    >
      <div className="flex items-start justify-between gap-3 text-xs font-semibold tracking-[0.14em] text-cyan-200">
        <div>
          <span>{fixture.match.statusLabel}</span>
          <p className="mt-1 font-medium tracking-normal text-slate-400">
            {fixture.stage}
          </p>
        </div>
        <HeatBadge heat={fixture.heat.value} />
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <p className="text-lg font-semibold text-white">
          {fixture.participant1}
        </p>
        <p className="rounded-xl bg-slate-950 px-3 py-2 font-mono text-xl font-bold text-white">
          {fixture.match.score1}–{fixture.match.score2}
        </p>
        <p className="text-lg font-semibold text-white">
          {fixture.participant2}
        </p>
      </div>
      <p className="mt-5 text-sm text-slate-400 group-hover:text-slate-200">
        Open the global Match Room <span aria-hidden="true">→</span>
      </p>
      {health === "stale" || hasReliabilityWarning ? (
        <p className="mt-3 text-xs font-semibold text-amber-200">
          {health === "stale" ? "Live data delayed" : "Data quality notice"}
        </p>
      ) : null}
    </Link>
  )
}
