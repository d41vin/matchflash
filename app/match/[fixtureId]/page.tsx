import { MatchRoomView } from "@/components/match-room/match-room-view"
import { getMatchRoomProjection } from "@/lib/match-room-projection"

export default async function MatchRoomPage({
  params,
}: {
  params: Promise<{ fixtureId: string }>
}) {
  const { fixtureId } = await params
  const fixture = getMatchRoomProjection(Number(fixtureId))

  if (!fixture) {
    return (
      <main className="grid min-h-svh place-items-center bg-slate-950 px-6 text-center text-slate-100">
        <div>
          <p className="text-sm font-semibold tracking-[0.16em] text-cyan-200">MATCHFLASH</p>
          <h1 className="mt-3 text-3xl font-bold">Fixture unavailable</h1>
          <p className="mt-3 text-slate-400">Choose a fixture from the lobby to open its Match Room.</p>
        </div>
      </main>
    )
  }

  return <MatchRoomView fixture={fixture} />
}
