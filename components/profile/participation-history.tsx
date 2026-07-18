"use client"

import { useQuery } from "convex/react"
import Link from "next/link"

import { useMatchFlashAuth } from "@/components/auth/matchflash-providers"
import { api } from "@/convex/_generated/api"

export function ParticipationHistory() {
  const { isAuthenticated, isLoading, requestSignIn } = useMatchFlashAuth()
  const history = useQuery(api.recaps.history, {})

  return (
    <section aria-labelledby="participation-history-title" className="mt-8">
      <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
        YOUR MATCHES
      </p>
      <h1 id="participation-history-title" className="mt-2 text-3xl font-bold text-white">
        Participation history
      </h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
        Finished fixtures where your live attendance was recorded.
      </p>

      {!isAuthenticated && !isLoading ? (
        <button
          className="mt-5 rounded-full bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100"
          onClick={() => void requestSignIn()}
          type="button"
        >
          Sign in to view history
        </button>
      ) : null}

      {history === undefined ? (
        <p className="mt-6 text-sm text-slate-400">Loading participation history…</p>
      ) : history.length === 0 && isAuthenticated ? (
        <p className="mt-6 rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-5 text-sm leading-6 text-slate-300">
          Your finished live participations will appear here as Recap Receipts.
        </p>
      ) : history.length > 0 ? (
        <ul className="mt-6 space-y-3">
          {history.map((fixture) => (
            <li key={fixture.fixtureId}>
              <Link
                className="block rounded-3xl border border-white/10 bg-slate-900 p-5 transition hover:border-cyan-300/40 hover:bg-slate-900/80"
                href={fixture.href}
              >
                <p className="text-xs font-semibold tracking-[0.12em] text-cyan-200">
                  {fixture.competition} ·{" "}
                  {new Date(fixture.startsAt).toLocaleDateString(undefined, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
                <p className="mt-2 text-lg font-bold text-white">
                  {fixture.participant1} {fixture.score1}–{fixture.score2} {fixture.participant2}
                </p>
                <p className="mt-2 text-sm font-medium text-cyan-100">Open Recap Receipt →</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}
