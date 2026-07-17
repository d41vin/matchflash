import type { AuthConfig } from "convex/server"

const issuer = process.env.MATCHFLASH_AUTH_ISSUER ?? "http://localhost:3000"
const audience = process.env.MATCHFLASH_AUTH_AUDIENCE ?? "matchflash"
const jwks = process.env.MATCHFLASH_AUTH_JWKS_URL ?? `${issuer}/.well-known/jwks.json`

export default {
  providers: [
    {
      type: "customJwt",
      applicationID: audience,
      issuer,
      jwks,
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig
