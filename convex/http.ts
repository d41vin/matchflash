import { httpRouter, type FunctionReference } from "convex/server"

import { internal } from "./_generated/api"
import { env, httpAction } from "./_generated/server"
import type { RawCaptureArgs, TxlineSource } from "./ingestion"

type IngestionApi = {
  ingestion: {
    captureRawEvent: FunctionReference<
      "mutation",
      "internal",
      RawCaptureArgs,
      { stored: boolean }
    >
    getResumeCheckpoint: FunctionReference<
      "query",
      "internal",
      { source: TxlineSource },
      string | null
    >
  }
}

// `internal` becomes fully typed when Convex code generation runs against the
// configured deployment. Keep this local pre-deploy bridge typed meanwhile.
const ingestion = internal as unknown as IngestionApi

function workerSecret(request: Request): Response | null {
  const expected = env.MATCHFLASH_WORKER_SECRET

  if (request.headers.get("Authorization") !== `Bearer ${expected}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  return null
}

function sourceFromRequest(request: Request): TxlineSource | null {
  const source = new URL(request.url).searchParams.get("source")
  return source === "scores" || source === "odds" ? source : null
}

const http = httpRouter()

http.route({
  path: "/txline/ingest",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const unauthorized = workerSecret(request)
    if (unauthorized) {
      return unauthorized
    }

    let payload: RawCaptureArgs
    try {
      payload = (await request.json()) as RawCaptureArgs
    } catch {
      return new Response("Expected a JSON capture payload.", { status: 400 })
    }

    const result = await ctx.runMutation(
      ingestion.ingestion.captureRawEvent,
      payload
    )
    return Response.json(result)
  }),
})

http.route({
  path: "/txline/checkpoint",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const unauthorized = workerSecret(request)
    if (unauthorized) {
      return unauthorized
    }

    const source = sourceFromRequest(request)
    if (!source) {
      return new Response("source must be scores or odds.", { status: 400 })
    }

    const lastEventId = await ctx.runQuery(
      ingestion.ingestion.getResumeCheckpoint,
      {
        source,
      }
    )
    return Response.json({ lastEventId })
  }),
})

export default http
