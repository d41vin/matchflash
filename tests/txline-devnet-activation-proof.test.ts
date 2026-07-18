import assert from "node:assert/strict"
import test from "node:test"

import { PublicKey } from "@solana/web3.js"

import { verifyTxlineDevnetActivationProof } from "../lib/txline-devnet-activation-proof.ts"

test("verifies a TxLINE activation signature against the signing wallet", async () => {
  const pair = await globalThis.crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"]
  )
  const signerAddress = new PublicKey(
    new Uint8Array(await globalThis.crypto.subtle.exportKey("raw", pair.publicKey))
  ).toBase58()
  const transactionSignature = "devnet-transaction-signature"
  const guestJwt = "guest-jwt"
  const message = new TextEncoder().encode(
    `${transactionSignature}::${guestJwt}`
  )
  const signature = Buffer.from(
    await globalThis.crypto.subtle.sign("Ed25519", pair.privateKey, message)
  ).toString("base64")

  assert.equal(
    await verifyTxlineDevnetActivationProof({
      transactionSignature,
      guestJwt,
      walletSignature: signature,
      signerAddress,
    }),
    true
  )
})

test("rejects a signature made over a different TxLINE activation message", async () => {
  const pair = await globalThis.crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"]
  )
  const signerAddress = new PublicKey(
    new Uint8Array(await globalThis.crypto.subtle.exportKey("raw", pair.publicKey))
  ).toBase58()
  const signature = Buffer.from(
    await globalThis.crypto.subtle.sign(
      "Ed25519",
      pair.privateKey,
      new TextEncoder().encode("a-different-message")
    )
  ).toString("base64")

  assert.equal(
    await verifyTxlineDevnetActivationProof({
      transactionSignature: "devnet-transaction-signature",
      guestJwt: "guest-jwt",
      walletSignature: signature,
      signerAddress,
    }),
    false
  )
})
