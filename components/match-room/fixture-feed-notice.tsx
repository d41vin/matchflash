"use client"

import { useEffect, useState } from "react"

import { feedHealthFor } from "@/lib/fixture-reconciliation"
import type { MatchRoomProjection } from "@/lib/match-room-projection"

export function fixtureHasReliabilityWarning(fixture: MatchRoomProjection) {
  const { reliability } = fixture.feed
  return (
    !reliability.cornersReliable ||
    !reliability.cardsReliable ||
    reliability.dataSuspended ||
    reliability.periodSuspectSinceAdjustment === true
  )
}

export function useFixtureFeedHealth(fixture: MatchRoomProjection) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 15_000)
    return () => window.clearInterval(interval)
  }, [])

  return feedHealthFor(fixture.feed.updatedAt, now).kind
}

export function FixtureFeedNotice({
  fixture,
}: {
  fixture: MatchRoomProjection
}) {
  const health = useFixtureFeedHealth(fixture)
  const { reliability } = fixture.feed

  if (health === "current" && !fixtureHasReliabilityWarning(fixture)) {
    return null
  }

  const messages = [
    ...(health === "stale"
      ? ["Live data is delayed. The scoreboard may be out of date."]
      : []),
    ...(reliability.dataSuspended
      ? ["The provider has marked match data unreliable."]
      : []),
    ...(!reliability.cornersReliable
      ? ["Corner statistics are under review."]
      : []),
    ...(!reliability.cardsReliable
      ? ["Card statistics are under review."]
      : []),
    ...(reliability.periodSuspectSinceAdjustment
      ? [
          "A score adjustment means other statistics in this period may be inaccurate.",
        ]
      : []),
  ]

  return (
    <section
      aria-live="polite"
      className="mt-5 rounded-3xl border border-amber-300/30 bg-amber-300/10 p-5 text-amber-50"
      role="status"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-amber-200">
        DATA QUALITY
      </p>
      <ul className="mt-2 space-y-1 text-sm leading-6">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </section>
  )
}
