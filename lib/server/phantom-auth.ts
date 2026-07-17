import {
  createHmac,
  createPrivateKey,
  createPublicKey,
  createSign,
  randomBytes,
  timingSafeEqual,
  verify,
} from "node:crypto"

import { PublicKey } from "@solana/web3.js"

const CHALLENGE_MAX_AGE_SECONDS = 5 * 60
export const PHANTOM_CHALLENGE_COOKIE = "matchflash_phantom_challenge"

type PhantomChallenge = {
  walletAddress: string
  nonce: string
  origin: string
  issuedAt: number
}

type MatchFlashJwtClaims = {
  sub: string
  walletAddress: string
  iss: string
  aud: string
  iat: number
  exp: number
}

function requiredEnvironment(name: string) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} must be configured.`)
  }
  return value
}

function pem(value: string) {
  return value.replace(/\\n/g, "\n")
}

function base64UrlJson(value: object) {
  return Buffer.from(JSON.stringify(value)).toString("base64url")
}

function challengeSignature(payload: string) {
  return createHmac("sha256", requiredEnvironment("MATCHFLASH_AUTH_CHALLENGE_SECRET"))
    .update(payload)
    .digest("base64url")
}

export function validateWalletAddress(walletAddress: string) {
  const key = new PublicKey(walletAddress)
  if (key.toBase58() !== walletAddress) {
    throw new Error("Wallet address is not canonical.")
  }
  return key
}

function messageForChallenge(challenge: PhantomChallenge) {
  return [
    "MatchFlash wallet verification",
    "",
    "This signature proves you control this wallet. It does not create a transaction or cost funds.",
    "",
    `Wallet: ${challenge.walletAddress}`,
    `Origin: ${challenge.origin}`,
    `Nonce: ${challenge.nonce}`,
    `Issued at: ${new Date(challenge.issuedAt * 1000).toISOString()}`,
  ].join("\n")
}

export function createSignedChallenge(walletAddress: string, origin: string) {
  validateWalletAddress(walletAddress)

  const challenge: PhantomChallenge = {
    walletAddress,
    nonce: randomBytes(32).toString("base64url"),
    origin,
    issuedAt: Math.floor(Date.now() / 1000),
  }
  const payload = base64UrlJson(challenge)

  return {
    cookieValue: `${payload}.${challengeSignature(payload)}`,
    message: messageForChallenge(challenge),
  }
}

export function readSignedChallenge(cookieValue: string | undefined, origin: string) {
  if (!cookieValue) {
    throw new Error("Wallet verification has expired. Please try again.")
  }

  const [payload, signature, ...rest] = cookieValue.split(".")
  if (!payload || !signature || rest.length > 0) {
    throw new Error("Wallet verification is invalid.")
  }

  const expectedSignature = challengeSignature(payload)
  const received = Buffer.from(signature)
  const expected = Buffer.from(expectedSignature)
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    throw new Error("Wallet verification is invalid.")
  }

  let challenge: PhantomChallenge
  try {
    challenge = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))
  } catch {
    throw new Error("Wallet verification is invalid.")
  }

  const now = Math.floor(Date.now() / 1000)
  if (
    challenge.origin !== origin ||
    !Number.isInteger(challenge.issuedAt) ||
    challenge.issuedAt > now ||
    now - challenge.issuedAt > CHALLENGE_MAX_AGE_SECONDS
  ) {
    throw new Error("Wallet verification has expired. Please try again.")
  }

  validateWalletAddress(challenge.walletAddress)
  return challenge
}

export function verifyPhantomSignature(
  walletAddress: string,
  message: string,
  encodedSignature: string
) {
  if (!/^[A-Za-z0-9_-]+$/.test(encodedSignature)) {
    return false
  }

  const signature = Buffer.from(encodedSignature, "base64url")
  if (signature.length !== 64) {
    return false
  }

  const walletKey = validateWalletAddress(walletAddress)
  const ed25519SpkiPrefix = Buffer.from("302a300506032b6570032100", "hex")
  const publicKey = createPublicKey({
    key: Buffer.concat([ed25519SpkiPrefix, Buffer.from(walletKey.toBytes())]),
    format: "der",
    type: "spki",
  })

  return verify(null, Buffer.from(message), publicKey, signature)
}

export function mintConvexToken(walletAddress: string) {
  const now = Math.floor(Date.now() / 1000)
  const claims: MatchFlashJwtClaims = {
    sub: walletAddress,
    walletAddress,
    iss: requiredEnvironment("MATCHFLASH_AUTH_ISSUER"),
    aud: requiredEnvironment("MATCHFLASH_AUTH_AUDIENCE"),
    iat: now,
    exp: now + 10 * 60,
  }
  const header = { alg: "RS256", kid: "matchflash-1", typ: "JWT" }
  const input = `${base64UrlJson(header)}.${base64UrlJson(claims)}`
  const signer = createSign("RSA-SHA256")
  signer.update(input)
  signer.end()

  return `${input}.${signer
    .sign(createPrivateKey(pem(requiredEnvironment("MATCHFLASH_AUTH_PRIVATE_KEY"))))
    .toString("base64url")}`
}

export function publicJwk() {
  const key = createPublicKey(pem(requiredEnvironment("MATCHFLASH_AUTH_PUBLIC_KEY")))
  const jwk = key.export({ format: "jwk" })

  return { ...jwk, alg: "RS256", kid: "matchflash-1", use: "sig" }
}

export function signedMessageForChallenge(challenge: PhantomChallenge) {
  return messageForChallenge(challenge)
}
