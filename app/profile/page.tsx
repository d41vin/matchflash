import Link from "next/link"

import { ParticipationHistory } from "@/components/profile/participation-history"

export default function ProfilePage() {
  return (
    <main className="min-h-svh bg-slate-950 px-4 py-6 text-slate-100 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <Link
          className="text-sm font-medium text-cyan-200 hover:text-cyan-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
          href="/lobby"
        >
          ← Back to lobby
        </Link>
        <ParticipationHistory />
      </div>
    </main>
  )
}
