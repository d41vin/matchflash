import { NextResponse } from "next/server"

import { publicJwk } from "@/lib/server/phantom-auth"

export const runtime = "nodejs"

export function GET() {
  return NextResponse.json(
    { keys: [publicJwk()] },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  )
}
