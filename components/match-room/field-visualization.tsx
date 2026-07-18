"use client"

import { useEffect, useRef, useState } from "react"
import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"
import {
  fieldReactionFor,
  type FieldReaction,
  type PhaseOneFieldEvent,
} from "@/lib/field-visualization"
import type { MatchRoomProjection } from "@/lib/match-room-projection"

const zoneClasses = {
  goal: "left-1/2 top-2 -translate-x-1/2",
  center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  corner: "bottom-3 left-4",
  border: "inset-2",
} as const

function isFieldReactionType(type: string): type is PhaseOneFieldEvent["type"] {
  return [
    "goal",
    "card",
    "corner",
    "varReview",
    "varResolved",
    "phaseChange",
  ].includes(type)
}

export function FieldVisualization({
  fixtureId,
  possession,
  visibleActionIds,
}: {
  fixtureId: number
  possession: MatchRoomProjection["field"]["possession"]
  visibleActionIds?: ReadonlySet<number | string>
}) {
  const timeline = useQuery(api.fixture_timeline.list, { fixtureId })
  const [reaction, setReaction] = useState<FieldReaction | null>(null)
  const seenActionIds = useRef<Set<number> | null>(null)

  useEffect(() => {
    if (!timeline) return

    const fieldEvents = timeline.filter(
      (
        event
      ): event is typeof event & {
        actionId: number
        type: PhaseOneFieldEvent["type"]
      } => typeof event.actionId === "number" && isFieldReactionType(event.type)
    )

    const visibleFieldEvents = visibleActionIds
      ? fieldEvents.filter((event) => visibleActionIds.has(event.actionId))
      : fieldEvents

    if (seenActionIds.current === null) {
      seenActionIds.current = new Set(
        visibleFieldEvents.map((event) => event.actionId)
      )
      return
    }

    for (const actionId of seenActionIds.current) {
      if (!visibleFieldEvents.some((event) => event.actionId === actionId)) {
        seenActionIds.current.delete(actionId)
      }
    }

    const nextEvent = [...visibleFieldEvents]
      .reverse()
      .find((event) => !seenActionIds.current?.has(event.actionId))
    for (const event of visibleFieldEvents) {
      seenActionIds.current.add(event.actionId)
    }
    if (!nextEvent) return

    const nextReaction = fieldReactionFor({
      type: nextEvent.type,
      participant: nextEvent.participant,
    })
    setReaction(nextReaction)
    const timer = window.setTimeout(() => setReaction(null), 1_800)
    return () => window.clearTimeout(timer)
  }, [timeline, visibleActionIds])

  const isTeamOnePressure = possession?.team === 1
  const isTeamTwoPressure = possession?.team === 2
  const pressureOpacity =
    possession?.intensity === "highDanger"
      ? "opacity-90"
      : possession?.intensity === "danger"
        ? "opacity-65"
        : possession?.intensity === "attack"
          ? "opacity-40"
          : "opacity-20"

  return (
    <section
      aria-labelledby="field-title"
      className="mt-5 overflow-hidden rounded-3xl border border-cyan-200/15 bg-slate-900 p-4 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
            MATCH FIELD
          </p>
          <h2 id="field-title" className="mt-2 text-xl font-bold text-white">
            Zone-based match signal
          </h2>
        </div>
        <p className="max-w-56 text-right text-xs leading-5 text-slate-400">
          Ambient pressure and moment zones — no player tracking, formations, or
          exact locations.
        </p>
      </div>

      <div
        aria-label={
          possession
            ? `${possession.intensity} possession intensity for team ${possession.team}`
            : "No current possession intensity signal"
        }
        className="relative mt-5 aspect-[16/8] min-h-48 overflow-hidden rounded-2xl bg-slate-950"
      >
        <div
          className={`absolute inset-y-0 left-0 w-1/3 bg-cyan-300/30 blur-2xl transition-opacity duration-500 ${
            isTeamOnePressure ? pressureOpacity : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 right-0 w-1/3 bg-rose-300/30 blur-2xl transition-opacity duration-500 ${
            isTeamTwoPressure ? pressureOpacity : "opacity-0"
          }`}
        />
        <div
          className="absolute inset-x-[5%] inset-y-[9%] border border-emerald-100/60 bg-emerald-400/15 shadow-[0_22px_35px_rgba(0,0,0,0.28)]"
          style={{ clipPath: "polygon(8% 0, 92% 0, 100% 100%, 0 100%)" }}
        >
          <div className="absolute inset-y-0 left-1/2 border-l border-emerald-50/55" />
          <div className="absolute top-1/2 left-1/2 aspect-square h-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-50/55" />
          <div className="absolute top-1/2 left-0 h-[52%] w-[13%] -translate-y-1/2 border border-l-0 border-emerald-50/55" />
          <div className="absolute top-1/2 right-0 h-[52%] w-[13%] -translate-y-1/2 border border-r-0 border-emerald-50/55" />
        </div>

        {reaction ? (
          <div
            aria-live="polite"
            className={`absolute ${zoneClasses[reaction.zone]} ${
              reaction.zone === "border"
                ? "rounded-xl border-2 border-dashed border-amber-100/90 bg-amber-200/10"
                : "rounded-full border border-white/70 bg-white/15 px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-cyan-200/25 motion-safe:animate-pulse"
            }`}
          >
            <span
              className={reaction.zone === "border" ? "sr-only" : undefined}
            >
              {reaction.label}
            </span>
          </div>
        ) : null}
      </div>
      <p className="mt-3 text-xs leading-5 text-slate-400">
        Field moments use the same classified timeline as Flash Cards. A zone is
        a visual cue, not a reported coordinate.
      </p>
    </section>
  )
}
