import { PublicKey } from "@solana/web3.js"

import { activationMessage } from "./txline-devnet-subscription.ts"

function asArrayBuffer(bytes: Uint8Array) {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer
}

export async function verifyTxlineDevnetActivationProof({
  transactionSignature,
  guestJwt,
  walletSignature,
  signerAddress,
}: {
  transactionSignature: string
  guestJwt: string
  walletSignature: string
  signerAddress: string
}) {
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    asArrayBuffer(new PublicKey(signerAddress).toBytes()),
    { name: "Ed25519" },
    false,
    ["verify"]
  )

  return globalThis.crypto.subtle.verify(
    "Ed25519",
    key,
    asArrayBuffer(Buffer.from(walletSignature, "base64")),
    new TextEncoder().encode(activationMessage(transactionSignature, guestJwt))
  )
}
