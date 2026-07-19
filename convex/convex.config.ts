import { defineApp } from "convex/server"
import { v } from "convex/values"

const app = defineApp({
  env: {
    MATCHFLASH_WORKER_SECRET: v.string(),
    MATCHFLASH_TROPHY_AUTHORITY_SECRET_KEY: v.optional(v.string()),
    MATCHFLASH_TROPHY_NETWORK: v.optional(v.string()),
    MATCHFLASH_TROPHY_OPERATOR_SECRET: v.optional(v.string()),
    MATCHFLASH_TROPHY_RPC_URL: v.optional(v.string()),
  },
})

export default app
