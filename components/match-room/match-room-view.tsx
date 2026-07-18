import Link from "next/link"

import { LiveParticipationControls } from "@/components/match-room/live-participation-controls"
import type { MatchRoomProjection } from "@/lib/match-room-projection"

import { FixtureFeedNotice } from "./fixture-feed-notice"
import { FieldVisualization } from "./field-visualization"
import { OddsPresentation } from "./odds-presentation"
import { ReplayMatchRoom } from "./replay-match-room"
import { RecapReceipt } from "./recap-receipt"
import { SocialRooms } from "./social-rooms"

export function MatchRoomView({ fixture }: { fixture: MatchRoomProjection }) {
  return (
    <main className="min-h-svh bg-slate-950 px-4 py-6 text-slate-100 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-medium text-cyan-200 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          href="/lobby"
        >
          ← Back to lobby
        </Link>

        <section
          aria-labelledby="match-room-title"
          className="mt-6 rounded-[2rem] border border-white/10 bg-slate-900 p-5 shadow-2xl shadow-cyan-950/20 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
              {fixture.competition}
            </p>
            <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
              Global Match Room
            </span>
          </div>

          <p className="mt-6 text-center text-sm font-semibold tracking-[0.14em] text-cyan-200">
            {fixture.match.statusLabel}
          </p>
          <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center sm:gap-6">
            <h1 id="match-room-title" className="text-xl font-bold sm:text-3xl">
              {fixture.participant1}
            </h1>
            <p className="rounded-2xl bg-slate-950 px-4 py-3 font-mono text-3xl font-bold sm:text-5xl">
              {fixture.match.score1}–{fixture.match.score2}
            </p>
            <p className="text-xl font-bold sm:text-3xl">
              {fixture.participant2}
            </p>
          </div>
          <p className="mt-5 text-center text-sm text-slate-400">
            {fixture.stage}
          </p>
        </section>

        {fixture.match.status === "final" ? (
          <>
            <ReplayMatchRoom fixture={fixture} />
            <RecapReceipt fixtureId={fixture.fixtureId} />
          </>
        ) : (
          <>
            <FixtureFeedNotice fixture={fixture} />

            <FieldVisualization
              fixtureId={fixture.fixtureId}
              possession={fixture.field.possession}
            />

            <OddsPresentation fixture={fixture} />

            {fixture.match.status === "live" ? (
              <LiveParticipationControls fixtureId={fixture.fixtureId} />
            ) : null}

            <section className="mt-5 rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-6 sm:p-8">
              <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
                MATCH SIGNALS
              </p>
              <h2 className="mt-3 text-xl font-bold text-white">
                Following this fixture together
              </h2>
              <p className="mt-2 max-w-prose text-sm leading-6 text-slate-300">
                This global room is open to everyone. Confirmed match signals will
                appear here as the fixture projection is connected to live data.
              </p>
              <p className="mt-5 text-sm font-medium text-slate-400">
                No sign-in or wallet is needed to follow a match.
              </p>
            </section>
          </>
        )}

        <SocialRooms fixtureId={fixture.fixtureId} />
      </div>
    </main>
  )
}
