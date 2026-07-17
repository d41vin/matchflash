import { NextRequest, NextResponse } from "next/server"

import {
  mintConvexToken,
  PHANTOM_CHALLENGE_COOKIE,
  readSignedChallenge,
  signedMessageForChallenge,
  verifyPhantomSignature,
} from "@/lib/server/phantom-auth"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  let signature: unknown
  try {
    ;({ signature } = await request.json())
  } catch {
    return NextResponse.json({ error: "Invalid wallet signature." }, { status: 400 })
  }

  if (typeof signature !== "string") {
    return NextResponse.json({ error: "Invalid wallet signature." }, { status: 400 })
  }

  try {
    const challenge = readSignedChallenge(
      request.cookies.get(PHANTOM_CHALLENGE_COOKIE)?.value,
      request.nextUrl.origin
    )
    const verified = verifyPhantomSignature(
      challenge.walletAddress,
      signedMessageForChallenge(challenge),
      signature
    )
    if (!verified) {
      return NextResponse.json({ error: "The wallet signature could not be verified." }, { status: 401 })
    }

    const response = NextResponse.json(
      { token: mintConvexToken(challenge.walletAddress) },
      { headers: { "Cache-Control": "no-store" } }
    )
    response.cookies.set(PHANTOM_CHALLENGE_COOKIE, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 0,
      path: "/api/auth/phantom",
    })
    return response
  } catch (error) {
    const message = error instanceof Error ? error.message : "Wallet verification failed."
    return NextResponse.json({ error: message }, { status: 401 })
  }
}
