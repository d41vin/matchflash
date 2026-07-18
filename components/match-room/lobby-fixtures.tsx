"use client"

import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"

import { FixtureCard } from "./fixture-card"

export function LobbyFixtures() {
  const fixtures = useQuery(api.fixture_projection.list, {})

  if (fixtures === undefined) {
    return <p className="mt-5 text-sm text-slate-400">Loading fixtures…</p>
  }

  if (fixtures.length === 0) {
    return (
      <p className="mt-5 rounded-2xl border border-dashed border-slate-700 p-5 text-sm text-slate-400">
        No source-backed fixtures are available yet.
      </p>
    )
  }

  return (
    <div className="mt-5 grid gap-4">
      {fixtures.map((fixture) => (
        <FixtureCard fixture={fixture} key={fixture.fixtureId} />
      ))}
    </div>
  )
}
