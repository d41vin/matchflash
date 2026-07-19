import { httpRouter, type FunctionReference } from "convex/server"

import { internal } from "./_generated/api"
import { env, httpAction } from "./_generated/server"
import type { RawCaptureArgs, TxlineSource } from "./ingestion"
import type { Id } from "./_generated/dataModel"

type WorkerApi = {
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
    syncFixtureSnapshot: FunctionReference<
      "mutation",
      "internal",
      {
        fixtures: Array<{
          fixtureId: number
          competition: string
          fixtureGroupId: number
          participant1: string
          participant2: string
          startsAt: string
        }>
      },
      { stored: number }
    >
  }
  odds: {
    listTaxonomy: FunctionReference<
      "query",
      "internal",
      { fixtureId: number },
      unknown
    >
    confirmStablePriceRow: FunctionReference<
      "mutation",
      "internal",
      { taxonomyId: Id<"oddsTaxonomies"> },
      null
    >
  }
}

// `internal` becomes fully typed when Convex code generation runs against the
// configured deployment. Keep this local pre-deploy bridge typed meanwhile.
const workerApi = internal as unknown as WorkerApi

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
      workerApi.ingestion.captureRawEvent,
      payload
    )
    return Response.json(result)
  }),
})

http.route({
  path: "/txline/fixtures/snapshot",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const unauthorized = workerSecret(request)
    if (unauthorized) {
      return unauthorized
    }

    let fixtures: unknown
    try {
      fixtures = ((await request.json()) as { fixtures?: unknown }).fixtures
    } catch {
      return new Response("Expected a JSON fixture snapshot.", { status: 400 })
    }
    if (!Array.isArray(fixtures)) {
      return new Response("fixtures must be an array.", { status: 400 })
    }

    return Response.json(
      await ctx.runMutation(workerApi.ingestion.syncFixtureSnapshot, {
        fixtures: fixtures as Array<{
          fixtureId: number
          competition: string
          fixtureGroupId: number
          participant1: string
          participant2: string
          startsAt: string
        }>,
      })
    )
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
      workerApi.ingestion.getResumeCheckpoint,
      {
        source,
      }
    )
    return Response.json({ lastEventId })
  }),
})

// These endpoints are for the operator-owned worker environment only. They
// make empirical taxonomy inspection and the deliberate confirmation step
// executable without exposing either operation to browsers.
http.route({
  path: "/txline/odds/taxonomy",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const unauthorized = workerSecret(request)
    if (unauthorized) return unauthorized

    const fixtureId = Number(new URL(request.url).searchParams.get("fixtureId"))
    if (!Number.isInteger(fixtureId)) {
      return new Response("fixtureId must be an integer.", { status: 400 })
    }
    return Response.json(
      await ctx.runQuery(workerApi.odds.listTaxonomy, { fixtureId })
    )
  }),
})

http.route({
  path: "/txline/odds/confirm",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const unauthorized = workerSecret(request)
    if (unauthorized) return unauthorized

    let taxonomyId: string | undefined
    try {
      const body = (await request.json()) as { taxonomyId?: unknown }
      taxonomyId =
        typeof body.taxonomyId === "string" ? body.taxonomyId : undefined
    } catch {
      return new Response("Expected a JSON confirmation payload.", {
        status: 400,
      })
    }
    if (!taxonomyId) {
      return new Response("taxonomyId is required.", { status: 400 })
    }

    await ctx.runMutation(workerApi.odds.confirmStablePriceRow, {
      taxonomyId: taxonomyId as Id<"oddsTaxonomies">,
    })
    return new Response(null, { status: 204 })
  }),
})

export default http
