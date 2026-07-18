import { NextResponse } from "next/server"

const DEVNET_GUEST_URL = "https://txline-dev.txodds.com/auth/guest/start"

export const runtime = "nodejs"

export async function POST() {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 })
  }

  const upstream = await fetch(DEVNET_GUEST_URL, { method: "POST", cache: "no-store" })
  const payload = (await upstream.json().catch(() => null)) as { token?: unknown } | null

  if (!upstream.ok || typeof payload?.token !== "string" || payload.token.length === 0) {
    return NextResponse.json(
      { error: "TxLINE Devnet did not issue a guest session." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    )
  }

  return NextResponse.json(
    { token: payload.token },
    { headers: { "Cache-Control": "no-store" } }
  )
}
