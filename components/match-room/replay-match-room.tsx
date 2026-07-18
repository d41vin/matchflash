"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import type { MatchRoomProjection } from "@/lib/match-room-projection"

import { FieldVisualization } from "./field-visualization"
import { FixtureFeedNotice } from "./fixture-feed-notice"
import { OddsPresentation } from "./odds-presentation"

const playbackSpeeds = [0.5, 1, 2] as const
const BASE_EVENT_INTERVAL_MS = 1_600

function cardTypeLabel(type: string) {
  return type.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())
}

export function ReplayMatchRoom({ fixture }: { fixture: MatchRoomProjection }) {
  const timeline = useQuery(api.fixture_timeline.list, {
    fixtureId: fixture.fixtureId,
  })
  const [playhead, setPlayhead] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState<(typeof playbackSpeeds)[number]>(1)

  const eventCount = timeline?.length ?? 0
  const position = Math.min(playhead ?? eventCount, eventCount)
  const revealedCards = useMemo(
    () => timeline?.slice(0, position) ?? [],
    [position, timeline]
  )
  const visibleActionIds = useMemo(
    () => new Set(revealedCards.map((card) => card.actionId)),
    [revealedCards]
  )
  const isPlaybackActive = isPlaying && position < eventCount

  useEffect(() => {
    if (!isPlaybackActive) return

    const timer = window.setTimeout(() => {
      setPlayhead((current) => Math.min((current ?? eventCount) + 1, eventCount))
    }, BASE_EVENT_INTERVAL_MS / speed)

    return () => window.clearTimeout(timer)
  }, [eventCount, isPlaybackActive, position, speed])

  function togglePlayback() {
    if (isPlaybackActive) {
      setIsPlaying(false)
      return
    }

    setPlayhead((current) => (current ?? eventCount) === eventCount ? 0 : current)
    setIsPlaying(true)
  }

  function scrubTo(nextPosition: number) {
    setIsPlaying(false)
    setPlayhead(Math.min(Math.max(nextPosition, 0), eventCount))
  }

  return (
    <>
      <FixtureFeedNotice fixture={fixture} />

      <section className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
              REPLAY
            </p>
            <h2 className="mt-2 text-xl font-bold text-white">Match timeline</h2>
          </div>
          <p className="rounded-full border border-cyan-300/25 bg-slate-950/70 px-3 py-1 text-xs font-semibold text-cyan-100">
            Local to your view
          </p>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Replay controls affect only this Match Room view. Historical Flash Cards and
          prompts are read-only, so watching does not record live attendance.
        </p>

        {timeline === undefined ? (
          <p className="mt-5 text-sm text-slate-400">Loading classified timelineâ€¦</p>
        ) : eventCount === 0 ? (
          <p className="mt-5 text-sm text-slate-400">
            No classified match moments are available for this fixture.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                className="rounded-full bg-cyan-200 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-100"
                onClick={togglePlayback}
                type="button"
              >
                {isPlaybackActive ? "Pause" : position === eventCount ? "Replay" : "Play"}
              </button>
              <button
                className="rounded-full border border-white/15 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-100 hover:border-cyan-200 hover:text-cyan-100"
                onClick={() => scrubTo(0)}
                type="button"
              >
                Restart
              </button>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <span>Speed</span>
                <select
                  className="rounded-lg border border-white/15 bg-slate-950 px-2 py-1 text-slate-100"
                  onChange={(event) =>
                    setSpeed(Number(event.target.value) as (typeof playbackSpeeds)[number])
                  }
                  value={speed}
                >
                  {playbackSpeeds.map((option) => (
                    <option key={option} value={option}>
                      {option}Ã—
                    </option>
                  ))}
                </select>
              </label>
              <p aria-live="polite" className="text-sm text-slate-400">
                Moment {position} of {eventCount}
              </p>
            </div>

            <input
              aria-label="Replay timeline position"
              className="w-full accent-cyan-200"
              max={eventCount}
              min={0}
              onChange={(event) => scrubTo(Number(event.target.value))}
              step={1}
              type="range"
              value={position}
            />
            <div aria-label="Replay moments" className="flex gap-1" role="group">
              {timeline.map((card, index) => (
                <button
                  aria-label={`Jump to moment ${index + 1}: ${card.title}`}
                  className={`h-2 flex-1 rounded-full transition-colors ${
                    index < position ? "bg-cyan-200" : "bg-slate-700"
                  }`}
                  key={card._id}
                  onClick={() => scrubTo(index + 1)}
                  type="button"
                />
              ))}
            </div>
          </div>
        )}
      </section>

      <FieldVisualization
        fixtureId={fixture.fixtureId}
        possession={position === eventCount ? fixture.field.possession : undefined}
        visibleActionIds={visibleActionIds}
      />

      <OddsPresentation fixture={fixture} visibleActionIds={visibleActionIds} />

      <section aria-labelledby="flash-cards-title" className="mt-5 space-y-3">
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-5 sm:p-6">
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
            FLASH CARDS
          </p>
          <h2 id="flash-cards-title" className="mt-2 text-xl font-bold text-white">
            Classified match moments
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            The replay uses the same correction-aware Match Room timeline as live
            viewing. These historical records are not interactive.
          </p>
        </div>

        {timeline !== undefined && revealedCards.length === 0 ? (
          <p className="rounded-3xl border border-white/10 bg-slate-900 p-5 text-sm text-slate-400">
            {eventCount === 0
              ? "No Flash Cards were recorded for this fixture."
              : "Press Play or scrub the timeline to reveal match moments."}
          </p>
        ) : null}

        {revealedCards.map((card, index) => (
          <article
            className="rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-lg shadow-slate-950/20"
            key={card._id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold tracking-[0.12em] text-cyan-200">
              <span>{cardTypeLabel(card.type)}</span>
              <span>MOMENT {index + 1}</span>
            </div>
            <p className="mt-3 text-base font-semibold text-white">{card.title}</p>
          </article>
        ))}
      </section>
    </>
  )
}
