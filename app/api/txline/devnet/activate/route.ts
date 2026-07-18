import { NextRequest, NextResponse } from "next/server"

import { txlineDevnetActivationError } from "@/lib/txline-devnet-activation-error"
import { verifyTxlineDevnetActivationProof } from "@/lib/txline-devnet-activation-proof"
import { txlineDevnetActivationPayload } from "@/lib/txline-devnet-activation-response"
import { TXLINE_DEVNET } from "@/lib/txline-devnet-subscription"

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

type SolanaTransactionResult = {
  transaction?: {
    message?: {
      accountKeys?: Array<{ pubkey?: unknown; signer?: unknown }>
    }
  }
}

async function transactionSigner(transactionSignature: string) {
  const response = await fetch(TXLINE_DEVNET.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "getTransaction",
      params: [
        transactionSignature,
        { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 },
      ],
    }),
    cache: "no-store",
  })
  const payload = (await response.json()) as {
    result?: SolanaTransactionResult
  }
  const signer = payload.result?.transaction?.message?.accountKeys?.find(
    (account) => account.signer === true && typeof account.pubkey === "string"
  )?.pubkey
  return typeof signer === "string" ? signer : null
}

async function activationProofDiagnostic(body: ActivationRequest) {
  try {
    const signer = await transactionSigner(body.txSig)
    if (!signer) return "TxLINE Devnet could not read the transaction signer."
    const isValid = await verifyTxlineDevnetActivationProof({
      transactionSignature: body.txSig,
      guestJwt: body.jwt,
      walletSignature: body.walletSignature,
      signerAddress: signer,
    })
    return isValid
      ? "The activation signature is valid for the on-chain signing wallet."
      : "The activation signature does not verify against the on-chain signing wallet."
  } catch {
    return "The local activation-signature diagnostic could not complete."
  }
}

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
  const payload = txlineDevnetActivationPayload(await upstream.text())

  if (!upstream.ok) {
    const diagnostic =
      upstream.status === 403 ? await activationProofDiagnostic(body) : null
    return NextResponse.json(
      {
        error: `${txlineDevnetActivationError(upstream.status, payload)}${
          diagnostic ? ` ${diagnostic}` : ""
        }`,
      },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    )
  }

  return NextResponse.json(payload, { headers: { "Cache-Control": "no-store" } })
}
