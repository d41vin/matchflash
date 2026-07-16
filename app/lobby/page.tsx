import { FixtureCard } from "@/components/match-room/fixture-card"
import { listLobbyFixtures } from "@/lib/match-room-projection"

export default function LobbyPage() {
  const fixtures = listLobbyFixtures()

  return (
    <main className="min-h-svh bg-slate-950 px-4 py-8 text-slate-100 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-cyan-200">MATCHFLASH</p>
        <h1 className="mt-3 max-w-xl text-4xl font-black tracking-tight text-white sm:text-5xl">
          Every fixture has one place to follow.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Browse a fixture and enter its global Match Room directly. No account
          or wallet is required.
        </p>

        <section aria-labelledby="fixtures-title" className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
                SOCCER
              </p>
              <h2 id="fixtures-title" className="mt-2 text-2xl font-bold text-white">
                Fixtures
              </h2>
            </div>
            <p className="text-right text-xs text-slate-400">Preview data</p>
          </div>
          <div className="mt-5 grid gap-4">
            {fixtures.map((fixture) => (
              <FixtureCard fixture={fixture} key={fixture.fixtureId} />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
