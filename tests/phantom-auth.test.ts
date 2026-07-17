import assert from "node:assert/strict"
import { generateKeyPairSync, sign } from "node:crypto"
import test from "node:test"

import { PublicKey } from "@solana/web3.js"

import {
  createSignedChallenge,
  mintConvexToken,
  publicJwk,
  readSignedChallenge,
  signedMessageForChallenge,
  verifyPhantomSignature,
} from "../lib/server/phantom-auth.ts"

const jwtKeys = generateKeyPairSync("rsa", { modulusLength: 2048 })
process.env.MATCHFLASH_AUTH_CHALLENGE_SECRET = "test-only-challenge-secret"
process.env.MATCHFLASH_AUTH_ISSUER = "https://matchflash.test"
process.env.MATCHFLASH_AUTH_AUDIENCE = "matchflash-test"
process.env.MATCHFLASH_AUTH_PRIVATE_KEY = jwtKeys.privateKey.export({
  type: "pkcs8",
  format: "pem",
}) as string
process.env.MATCHFLASH_AUTH_PUBLIC_KEY = jwtKeys.publicKey.export({
  type: "spki",
  format: "pem",
}) as string

test("only the wallet that signed the server-issued challenge can complete authentication", () => {
  const wallet = generateKeyPairSync("ed25519")
  const walletPublicDer = wallet.publicKey.export({ type: "spki", format: "der" })
  const walletAddress = new PublicKey(walletPublicDer.subarray(-32)).toBase58()
  const challenge = createSignedChallenge(walletAddress, "https://matchflash.test")
  const verifiedChallenge = readSignedChallenge(challenge.cookieValue, "https://matchflash.test")
  const message = signedMessageForChallenge(verifiedChallenge)
  const signature = sign(null, Buffer.from(message), wallet.privateKey).toString("base64url")

  assert.equal(verifyPhantomSignature(walletAddress, message, signature), true)
  assert.equal(verifyPhantomSignature(walletAddress, `${message} altered`, signature), false)
})

test("the Convex token has the verified wallet as its immutable subject", () => {
  const walletAddress = "11111111111111111111111111111111"
  const token = mintConvexToken(walletAddress)
  const [, encodedClaims] = token.split(".")
  const claims = JSON.parse(Buffer.from(encodedClaims, "base64url").toString("utf8"))

  assert.equal(claims.sub, walletAddress)
  assert.equal(claims.walletAddress, walletAddress)
  assert.equal(claims.iss, "https://matchflash.test")
  assert.equal(claims.aud, "matchflash-test")
  assert.equal(publicJwk().kid, "matchflash-1")
})
