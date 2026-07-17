"use client"

import { useMutation } from "convex/react"
import { makeFunctionReference } from "convex/server"
import { useState } from "react"

import { useMatchFlashAuth } from "@/components/auth/matchflash-providers"

const recordLiveReactionReference = makeFunctionReference<
  "mutation",
  { fixtureId: number; reaction: "cheer" | "wow" | "nervous" },
  { reactionId: string }
>("participation:recordLiveReaction")

const reactions = [
  { value: "cheer", label: "Cheer", symbol: "🙌" },
  { value: "wow", label: "Wow", symbol: "🤯" },
  { value: "nervous", label: "Nervous", symbol: "😬" },
] as const

export function LiveParticipationControls({ fixtureId }: { fixtureId: number }) {
  const { error: authError, isAuthenticated, isLoading, requestSignIn } = useMatchFlashAuth()
  const recordReaction = useMutation(recordLiveReactionReference)
  const [showSignInNudge, setShowSignInNudge] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)

  async function react(reaction: (typeof reactions)[number]["value"]) {
    if (!isAuthenticated) {
      setShowSignInNudge(true)
      return
    }

    setIsSending(true)
    setStatus(null)
    try {
      await recordReaction({ fixtureId, reaction })
      setStatus("Reaction recorded — you’re part of this match’s live attendance.")
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Could not record that reaction.")
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section
      aria-labelledby="live-reactions-title"
      className="mt-5 rounded-3xl border border-cyan-300/20 bg-cyan-300/5 p-5 sm:p-6"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">LIVE TOGETHER</p>
      <h2 id="live-reactions-title" className="mt-2 text-xl font-bold text-white">
        React to the moment
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Reactions made while the match is live count toward Digital Trophy eligibility.
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {reactions.map((reaction) => (
          <button
            className="rounded-full border border-white/15 bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-200 hover:text-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading || isSending}
            key={reaction.value}
            onClick={() => void react(reaction.value)}
            type="button"
          >
            <span aria-hidden="true">{reaction.symbol} </span>
            {reaction.label}
          </button>
        ))}
      </div>

      {showSignInNudge && !isAuthenticated ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-3 text-sm text-slate-200">
          <p>Sign in to react live and record your attendance.</p>
          <button
            className="rounded-full bg-cyan-200 px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-cyan-100 disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void requestSignIn()}
            type="button"
          >
            Continue to react
          </button>
        </div>
      ) : null}

      {status || authError ? (
        <p aria-live="polite" className="mt-4 text-sm text-cyan-100">
          {status ?? authError}
        </p>
      ) : null}
    </section>
  )
}
