"use client"

import { useMutation, useQuery } from "convex/react"
import { makeFunctionReference } from "convex/server"
import { useState } from "react"

import { useMatchFlashAuth } from "@/components/auth/matchflash-providers"
import type { Id } from "@/convex/_generated/dataModel"

const listRooms = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{
    _id: Id<"rooms">
    kind: "global" | "public" | "private"
    name: string
    frozen: boolean
  }>
>("rooms:list")
const createRoom = makeFunctionReference<
  "mutation",
  { fixtureId: number; kind: "public" | "private"; name: string },
  { roomId: Id<"rooms"> }
>("rooms:create")
const joinRoom = makeFunctionReference<"mutation", { roomId: Id<"rooms"> }, null>("rooms:join")
const matchStandings = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{ displayName: string; score: number }>
>("rooms:matchStandings")
const roomStandings = makeFunctionReference<
  "query",
  { roomId: Id<"rooms"> },
  Array<{ displayName: string; score: number }>
>("rooms:standings")
const fixtureTimeline = makeFunctionReference<
  "query",
  { fixtureId: number },
  Array<{ _id: Id<"flashCards">; title: string }>
>("fixture_timeline:list")
const recordReaction = makeFunctionReference<
  "mutation",
  { roomId: Id<"rooms">; flashCardId: Id<"flashCards">; reaction: "cheer" | "wow" | "nervous" },
  { reactionId: Id<"roomReactions"> }
>("rooms:recordReaction")

export function SocialRooms({ fixtureId }: { fixtureId: number }) {
  const { isAuthenticated, isLoading, requestSignIn } = useMatchFlashAuth()
  const [activeRoomId, setActiveRoomId] = useState<Id<"rooms"> | null>(null)
  const rooms = useQuery(listRooms, { fixtureId })
  const standings = useQuery(matchStandings, { fixtureId })
  const activeRoomStandings = useQuery(
    roomStandings,
    activeRoomId ? { roomId: activeRoomId } : "skip"
  )
  const flashCards = useQuery(fixtureTimeline, { fixtureId })
  const create = useMutation(createRoom)
  const join = useMutation(joinRoom)
  const react = useMutation(recordReaction)
  const [name, setName] = useState("")
  const [kind, setKind] = useState<"public" | "private">("public")
  const [status, setStatus] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const frozen = rooms?.some((room) => room.frozen) ?? false
  const publicRooms = rooms?.filter((room) => room.kind === "public") ?? []

  async function requireAuth() {
    if (isAuthenticated) return true
    setStatus("Sign in to join or create a Room.")
    await requestSignIn()
    return false
  }

  async function createSocialRoom() {
    if (!(await requireAuth())) return
    setIsSaving(true)
    setStatus(null)
    try {
      const room = await create({ fixtureId, kind, name })
      setActiveRoomId(room.roomId)
      setName("")
      setStatus(`${kind === "public" ? "Public" : "Private"} Room created.`)
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Could not create the Room.")
    } finally {
      setIsSaving(false)
    }
  }

  async function joinPublicRoom(roomId: Id<"rooms">) {
    if (!(await requireAuth())) return
    setIsSaving(true)
    setStatus(null)
    try {
      await join({ roomId })
      setActiveRoomId(roomId)
      setStatus("Joined Room. Room reactions and standings are now available.")
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Could not join the Room.")
    } finally {
      setIsSaving(false)
    }
  }

  async function reactToFlash(flashCardId: Id<"flashCards">, reaction: "cheer" | "wow" | "nervous") {
    if (!activeRoomId || !(await requireAuth())) return
    setIsSaving(true)
    setStatus(null)
    try {
      await react({ roomId: activeRoomId, flashCardId, reaction })
      setStatus("Room reaction recorded.")
    } catch (cause) {
      setStatus(cause instanceof Error ? cause.message : "Could not record that reaction.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="mt-5 rounded-3xl border border-violet-300/20 bg-violet-300/5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-violet-200">SOCIAL ROOMS</p>
          <h2 className="mt-2 text-xl font-bold text-white">
            {frozen ? "View Rooms" : "Watch with your people"}
          </h2>
          <p className="mt-2 max-w-prose text-sm leading-6 text-slate-300">
            The global Match Room stays open to everyone. Public and private Rooms are
            optional social spaces with their own standings.
          </p>
        </div>
        {frozen ? (
          <span className="rounded-full border border-slate-500/40 px-3 py-1 text-xs font-semibold text-slate-300">
            Read-only
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-slate-950/65 p-4">
          <h3 className="font-semibold text-white">Match standings</h3>
          {standings?.length ? (
            <ol className="mt-3 space-y-2 text-sm text-slate-200">
              {standings.slice(0, 5).map((standing, index) => (
                <li className="flex justify-between" key={`${standing.displayName}-${index}`}>
                  <span>{index + 1}. {standing.displayName}</span>
                  <span className="font-mono text-violet-200">{standing.score}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-slate-400">Join a social Room to appear here.</p>
          )}
        </div>

        <div className="rounded-2xl bg-slate-950/65 p-4">
          <h3 className="font-semibold text-white">Public Rooms</h3>
          {publicRooms.length ? (
            <ul className="mt-3 space-y-3">
              {publicRooms.map((room) => (
                <li className="flex items-center justify-between gap-3 text-sm" key={room._id}>
                  <span className="font-medium text-slate-200">{room.name}</span>
                  <button
                    className="rounded-full border border-violet-200/30 px-3 py-1.5 font-semibold text-violet-100 disabled:opacity-50"
                    disabled={frozen || isLoading || isSaving}
                    onClick={() => void joinPublicRoom(room._id)}
                    type="button"
                  >
                    Join
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No public Rooms yet.</p>
          )}
        </div>
      </div>

      {!frozen ? (
        <form
          className="mt-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/65 p-4 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            void createSocialRoom()
          }}
        >
          <input
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-violet-200"
            maxLength={48}
            onChange={(event) => setName(event.target.value)}
            placeholder="Room name"
            required
            value={name}
          />
          <select
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white"
            onChange={(event) => setKind(event.target.value as "public" | "private")}
            value={kind}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          <button
            className="rounded-xl bg-violet-200 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
            disabled={isLoading || isSaving}
            type="submit"
          >
            Create Room
          </button>
        </form>
      ) : null}
      {activeRoomId && !frozen ? (
        <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/65 p-4">
          <h3 className="font-semibold text-white">Room standings</h3>
          {activeRoomStandings?.length ? (
            <ol className="mt-3 space-y-2 text-sm text-slate-200">
              {activeRoomStandings.slice(0, 5).map((standing, index) => (
                <li className="flex justify-between" key={`${standing.displayName}-${index}`}>
                  <span>{index + 1}. {standing.displayName}</span>
                  <span className="font-mono text-violet-200">{standing.score}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No Room members yet.</p>
          )}
          <h3 className="mt-5 font-semibold text-white">React in this Room</h3>
          <p className="mt-1 text-sm text-slate-400">These reactions belong only to your selected social Room.</p>
          <ul className="mt-3 space-y-3">
            {flashCards?.slice(0, 3).map((card) => (
              <li className="flex flex-wrap items-center justify-between gap-3" key={card._id}>
                <span className="text-sm text-slate-200">{card.title}</span>
                <span className="flex gap-2">
                  {(["cheer", "wow", "nervous"] as const).map((reaction) => (
                    <button
                      className="rounded-full border border-white/15 px-3 py-1 text-xs font-semibold text-slate-100 disabled:opacity-50"
                      disabled={isSaving || isLoading}
                      key={reaction}
                      onClick={() => void reactToFlash(card._id, reaction)}
                      type="button"
                    >
                      {reaction}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {status ? <p aria-live="polite" className="mt-3 text-sm text-violet-100">{status}</p> : null}
    </section>
  )
}
