"use client"

import { useQuery } from "convex/react"

import { api } from "@/convex/_generated/api"

import { MatchRoomView } from "./match-room-view"

export function MatchRoomFixture({ fixtureId }: { fixtureId: number }) {
  const fixture = useQuery(api.fixture_projection.get, { fixtureId })

  if (fixture === undefined) {
    return (
      <main className="grid min-h-svh place-items-center bg-slate-950 px-6 text-center text-slate-100">
        <p className="text-slate-400">Loading fixture…</p>
      </main>
    )
  }

  if (!fixture) {
    return (
      <main className="grid min-h-svh place-items-center bg-slate-950 px-6 text-center text-slate-100">
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-cyan-200">
            MATCHFLASH
          </p>
          <h1 className="mt-3 text-3xl font-bold">Fixture unavailable</h1>
          <p className="mt-3 text-slate-400">
            Choose a fixture from the lobby to open its Match Room.
          </p>
        </div>
      </main>
    )
  }

  return <MatchRoomView fixture={fixture} />
}
