import { NextRequest, NextResponse } from "next/server"

const DEVNET_ACTIVATION_URL = "https://txline-dev.txodds.com/api/token/activate"

type ActivationRequest = {
  jwt: string
  txSig: string
  walletSignature: string
}

function activationRequest(value: unknown): ActivationRequest | null {
  if (typeof value !== "object" || value === null) return null
  const { jwt, txSig, walletSignature } = value as Record<string, unknown>
  if (
    typeof jwt !== "string" ||
    typeof txSig !== "string" ||
    typeof walletSignature !== "string" ||
    jwt.length === 0 ||
    txSig.length === 0 ||
    walletSignature.length === 0
  ) {
    return null
  }
  return { jwt, txSig, walletSignature }
}

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse(null, { status: 404 })
  }

  const body = activationRequest(await request.json().catch(() => null))
  if (!body) {
    return NextResponse.json({ error: "Invalid TxLINE activation request." }, { status: 400 })
  }

  const upstream = await fetch(DEVNET_ACTIVATION_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${body.jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      txSig: body.txSig,
      walletSignature: body.walletSignature,
      leagues: [],
    }),
    cache: "no-store",
  })
  const payload = await upstream.json().catch(() => null)

  if (!upstream.ok) {
    return NextResponse.json(
      { error: "TxLINE Devnet activation failed. Check the transaction and wallet match." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    )
  }

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } })
}
