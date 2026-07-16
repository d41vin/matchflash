import Link from "next/link"

import type { MatchRoomProjection } from "@/lib/match-room-projection"

export function FixtureCard({ fixture }: { fixture: MatchRoomProjection }) {
  return (
    <Link
      aria-label={`Open Match Room: ${fixture.participant1} versus ${fixture.participant2}`}
      className="group block rounded-3xl border border-white/10 bg-slate-900 p-5 transition hover:border-cyan-300/60 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
      href={fixture.matchRoomHref}
    >
      <div className="flex items-center justify-between gap-3 text-xs font-semibold tracking-[0.14em] text-cyan-200">
        <span>{fixture.match.statusLabel}</span>
        <span className="text-slate-400">{fixture.stage}</span>
      </div>
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <p className="text-lg font-semibold text-white">{fixture.participant1}</p>
        <p className="rounded-xl bg-slate-950 px-3 py-2 font-mono text-xl font-bold text-white">
          {fixture.match.score1}–{fixture.match.score2}
        </p>
        <p className="text-lg font-semibold text-white">{fixture.participant2}</p>
      </div>
      <p className="mt-5 text-sm text-slate-400 group-hover:text-slate-200">
        Open the global Match Room <span aria-hidden="true">→</span>
      </p>
    </Link>
  )
}
