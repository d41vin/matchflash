"use client"

import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { MatchRoomProjection } from "@/lib/match-room-projection"

function Probability({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-slate-950/70 px-3 py-3 text-center">
      <p className="text-xs font-semibold tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-white">{value.toFixed(1)}%</p>
    </div>
  )
}

export function OddsPresentation({
  fixture,
}: {
  fixture: MatchRoomProjection
}) {
  const timeline = useQuery(api.fixture_timeline.list, {
    fixtureId: fixture.fixtureId,
  })

  if (fixture.odds.availability === "unavailable") {
    return (
      <section className="mt-5 rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-5">
        <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
          WIN PROBABILITIES
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          StablePrice consensus is being verified for this feed. Probabilities
          and odds swings will appear only after its observed market row is
          confirmed.
        </p>
      </section>
    )
  }

  const swings = timeline?.filter((card) => card.type === "oddsSwing") ?? []
  return (
    <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
          STABLEPRICE WIN PROBABILITIES
        </p>
        <p className="text-xs text-slate-400">
          {fixture.odds.provenance.bookmaker}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        <Probability label={fixture.participant1} value={fixture.odds.home} />
        <Probability label="Draw" value={fixture.odds.draw} />
        <Probability label={fixture.participant2} value={fixture.odds.away} />
      </div>
      {swings.length > 0 ? (
        <div className="mt-4 border-t border-cyan-300/15 pt-4">
          <p className="text-xs font-semibold tracking-[0.14em] text-cyan-100">
            ODDS SWINGS
          </p>
          <ul className="mt-2 space-y-2">
            {swings.map((swing) => (
              <li className="text-sm text-slate-200" key={swing._id}>
                {swing.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}
