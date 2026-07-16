import Link from "next/link"

export default function Page() {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-xl text-center">
        <p className="text-sm font-semibold tracking-[0.18em] text-cyan-200">MATCHFLASH</p>
        <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
          Follow the match, without the friction.
        </h1>
        <p className="mt-5 text-slate-300">
          Browse fixtures and open a global Match Room with no account or wallet.
        </p>
        <Link
          className="mt-8 inline-flex rounded-full bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          href="/lobby"
        >
          Browse fixtures
        </Link>
      </div>
    </main>
  )
}
