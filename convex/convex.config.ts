import { defineApp } from "convex/server"
import { v } from "convex/values"

const app = defineApp({
  env: {
    MATCHFLASH_WORKER_SECRET: v.string(),
  },
})

export default app
