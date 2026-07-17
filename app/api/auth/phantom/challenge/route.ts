import { NextRequest, NextResponse } from "next/server"

import {
  createSignedChallenge,
  PHANTOM_CHALLENGE_COOKIE,
} from "@/lib/server/phantom-auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  let walletAddress: unknown
  try {
    ;({ walletAddress } = await request.json())
  } catch {
    return NextResponse.json({ error: "Invalid wallet verification request." }, { status: 400 })
  }

  if (typeof walletAddress !== "string") {
    return NextResponse.json({ error: "A Solana wallet is required." }, { status: 400 })
  }

  try {
    const challenge = createSignedChallenge(walletAddress, request.nextUrl.origin)
    const response = NextResponse.json(
      { message: challenge.message },
      { headers: { "Cache-Control": "no-store" } }
    )

    response.cookies.set(PHANTOM_CHALLENGE_COOKIE, challenge.cookieValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 5 * 60,
      path: "/api/auth/phantom",
    })
    return response
  } catch {
    return NextResponse.json({ error: "The wallet address is invalid." }, { status: 400 })
  }
}
