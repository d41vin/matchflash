import { NextRequest, NextResponse } from "next/server"

const MAINNET_RPC_URL = "https://api.mainnet-beta.solana.com"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 })
  }

  const body = await request.text()
  if (body.length === 0) {
    return NextResponse.json({ error: "Missing Solana RPC request." }, { status: 400 })
  }

  const upstream = await fetch(MAINNET_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    cache: "no-store",
  })

  return new NextResponse(await upstream.text(), {
    status: upstream.status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json",
    },
  })
}
