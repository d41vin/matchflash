"use client"

import { useMutation, useQuery } from "convex/react"
import Link from "next/link"
import { useState } from "react"

import { useMatchFlashAuth } from "@/components/auth/matchflash-providers"
import { api } from "@/convex/_generated/api"

function outcomeLabel(result: "win" | "loss" | "void" | undefined) {
  if (result === "win") return "Correct"
  if (result === "loss") return "Not correct"
  if (result === "void") return "Voided"
  return "Unsettled"
}

export function RecapReceipt({ fixtureId }: { fixtureId: number }) {
  const recap = useQuery(api.recaps.get, { fixtureId })
  const { isAuthenticated } = useMatchFlashAuth()
  const requestClaim = useMutation(api.trophies.requestClaim)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [isRequestingClaim, setIsRequestingClaim] = useState(false)

  if (recap === undefined) {
    return (
      <section className="mt-5 rounded-3xl border border-white/10 bg-slate-900 p-5 text-sm text-slate-400 sm:p-6">
        Preparing Recap Receipt…
      </section>
    )
  }
  if (!recap) return null

  const { shared, participant } = recap
  async function claimTrophy() {
    setClaimError(null)
    setIsRequestingClaim(true)
    try {
      await requestClaim({ fixtureId })
    } catch (error) {
      setClaimError(
        error instanceof Error
          ? error.message
          : "Your Digital Trophy could not be requested."
      )
    } finally {
      setIsRequestingClaim(false)
    }
  }
  return (
    <section
      aria-labelledby="recap-receipt-title"
      className="mt-5 rounded-3xl border border-cyan-300/25 bg-cyan-300/5 p-5 shadow-xl shadow-cyan-950/10 sm:p-6"
    >
      <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
        RECAP RECEIPT
      </p>
      <h2
        id="recap-receipt-title"
        className="mt-2 text-2xl font-bold text-white"
      >
        {shared.headline}
      </h2>
      <p className="mt-2 text-sm text-slate-300">
        {shared.competition} · {shared.stage} ·{" "}
        {new Date(shared.startsAt).toLocaleDateString(undefined, {
          day: "numeric",
          month: "short",
          year: "numeric",
        })}
      </p>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <dt className="text-xs font-semibold tracking-[0.12em] text-cyan-200">
            BIGGEST SWING
          </dt>
          <dd className="mt-2 text-sm leading-6 text-slate-200">
            {shared.biggestSwing
              ? `${shared.biggestSwing.title} (${shared.biggestSwing.change.toFixed(0)} points)`
              : "No confirmed odds swing was recorded."}
          </dd>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
          <dt className="text-xs font-semibold tracking-[0.12em] text-cyan-200">
            PEAK HEAT
          </dt>
          <dd className="mt-2 text-sm leading-6 text-slate-200">
            {shared.peakHeat === null
              ? "No peak Heat was recorded."
              : `${shared.peakHeat.toFixed(1)} at ${new Date(
                  shared.peakHeatUpdatedAt!
                ).toLocaleTimeString(undefined, {
                  hour: "numeric",
                  minute: "2-digit",
                })}.`}
          </dd>
        </div>
      </dl>

      {shared.dataQualityNotes.length > 0 ? (
        <div className="mt-4 rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4">
          <h3 className="text-sm font-semibold text-amber-100">Data quality</h3>
          <ul className="mt-2 space-y-1 text-sm leading-6 text-amber-50/90">
            {shared.dataQualityNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {participant ? (
        <div className="mt-5 border-t border-cyan-300/20 pt-5">
          <p className="text-xs font-semibold tracking-[0.16em] text-cyan-200">
            YOUR LIVE PARTICIPATION
          </p>
          {participant.matchStanding ? (
            <p className="mt-2 text-sm text-slate-200">
              Match standing: <strong>{participant.matchStanding.rank}</strong>{" "}
              of {participant.matchStanding.participantCount} ·{" "}
              {participant.matchStanding.score} point
              {participant.matchStanding.score === 1 ? "" : "s"}
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate-300">
              Your live attendance is recorded. Make a live prediction to
              receive a match standing.
            </p>
          )}

          {participant.predictions.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {participant.predictions.map((prediction) => (
                <li
                  className="rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-sm"
                  key={prediction.promptId}
                >
                  <p className="font-medium text-white">
                    {prediction.question}
                  </p>
                  <p className="mt-1 text-slate-300">
                    {prediction.optionLabel} · {outcomeLabel(prediction.result)}{" "}
                    · {prediction.pointsAwarded} point
                    {prediction.pointsAwarded === 1 ? "" : "s"}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-5 rounded-2xl border border-cyan-300/25 bg-cyan-300/5 p-4">
            <h3 className="text-sm font-semibold text-cyan-100">
              Digital Trophy
            </h3>
            {participant.eligibility.claimStatus === "unclaimed" ||
            participant.eligibility.claimStatus === "failed" ? (
              <>
                <p className="mt-2 text-sm leading-6 text-slate-200">
                  {participant.eligibility.claimStatus === "failed"
                    ? "Your earlier request did not reach Mainnet. You can retry this free claim."
                    : "Claim one free, non-transferable commemorative trophy on Solana Mainnet. MatchFlash covers every cost."}
                </p>
                <button
                  className="mt-4 inline-flex rounded-xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isRequestingClaim}
                  onClick={() => void claimTrophy()}
                  type="button"
                >
                  {isRequestingClaim
                    ? "Requesting trophy…"
                    : participant.eligibility.claimStatus === "failed"
                      ? "Retry Mainnet Digital Trophy"
                      : "Claim Mainnet Digital Trophy"}
                </button>
              </>
            ) : null}
            {participant.eligibility.claimStatus === "minting" ? (
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Your sponsored Mainnet mint is in progress. This page will
                update when your trophy is claimed.
              </p>
            ) : null}
            {participant.eligibility.claimStatus === "claimed" ? (
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Your free Mainnet trophy is claimed.{" "}
                {participant.trophy?.mintAddress ? (
                  <a
                    className="font-semibold text-cyan-200 hover:text-cyan-100"
                    href={`https://explorer.solana.com/address/${participant.trophy.mintAddress}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    View it on Solana Explorer.
                  </a>
                ) : null}
              </p>
            ) : null}
            {claimError ? (
              <p className="mt-3 text-sm leading-6 text-amber-100">
                {claimError}
              </p>
            ) : null}
          </div>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-cyan-200 hover:text-cyan-100"
            href="/profile"
          >
            View participation history →
          </Link>
        </div>
      ) : (
        <p className="mt-5 border-t border-cyan-300/20 pt-5 text-sm leading-6 text-slate-300">
          {isAuthenticated
            ? "Personal results appear here when a live reaction or prediction was recorded for this fixture."
            : "Sign in to see any personal live participation recorded for this fixture."}
        </p>
      )}
    </section>
  )
}
