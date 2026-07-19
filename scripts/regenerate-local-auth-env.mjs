import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
} from "node:crypto"
import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"

const envPath = resolve(process.cwd(), ".env.local")

function oneLinePem(value) {
  return value.replace(/\n/g, "\\n")
}

function replaceAssignment(contents, name, value, pemKind) {
  const singleLine = `${name}="${value}"`
  if (pemKind) {
    const malformedPem = new RegExp(
      `^${name}=-----BEGIN ${pemKind} KEY-----[\\s\\S]*?^-----END ${pemKind} KEY-----\\r?\\n?`,
      "m"
    )
    if (malformedPem.test(contents)) {
      return contents.replace(malformedPem, `${singleLine}\n`)
    }
  }

  const assignment = new RegExp(`^${name}=.*$`, "m")
  return assignment.test(contents)
    ? contents.replace(assignment, singleLine)
    : `${contents.replace(/\s*$/, "")}\n${singleLine}\n`
}

const existing = await readFile(envPath, "utf8")
const keys = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" },
  publicKeyEncoding: { type: "spki", format: "pem" },
})

// Validate before replacing the existing local configuration.
const privateKey = createPrivateKey(keys.privateKey)
const publicKey = createPublicKey(keys.publicKey)
if (
  !createPublicKey(privateKey)
    .export({ format: "der", type: "spki" })
    .equals(publicKey.export({ format: "der", type: "spki" }))
) {
  throw new Error("Generated JWT key pair did not validate.")
}

let next = existing
next = replaceAssignment(
  next,
  "MATCHFLASH_AUTH_PRIVATE_KEY",
  oneLinePem(keys.privateKey),
  "PRIVATE"
)
next = replaceAssignment(
  next,
  "MATCHFLASH_AUTH_PUBLIC_KEY",
  oneLinePem(keys.publicKey),
  "PUBLIC"
)
next = replaceAssignment(
  next,
  "MATCHFLASH_AUTH_CHALLENGE_SECRET",
  randomBytes(32).toString("base64url")
)

await writeFile(envPath, next, "utf8")
console.log("Regenerated and stored local MatchFlash auth credentials in .env.local.")
