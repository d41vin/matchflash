import { PhantomConnectCallback } from "@/components/auth/phantom-connect-callback"

export default function PhantomCallbackPage() {
  return (
    <main className="grid min-h-svh place-items-center bg-slate-950 p-6 text-slate-100">
      <section className="w-full max-w-sm rounded-3xl border border-white/10 bg-slate-900 p-6 text-center shadow-2xl shadow-cyan-950/30">
        <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">MATCHFLASH</p>
        <h1 className="mt-3 text-2xl font-bold">Finishing sign-in</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          You’ll return to MatchFlash as soon as your secure sign-in is complete.
        </p>
        <div className="mt-6 flex justify-center">
          <PhantomConnectCallback />
        </div>
      </section>
    </main>
  )
}
