import {
  createCaptureRecord,
  parseSseAsync,
  shouldIgnoreSseEvent,
  type RawCaptureRecord,
  type TxlineSource,
} from "./txline-protocol.ts"

const MAINNET_API_ORIGIN = "https://txline.txodds.com"
const RECONNECT_MIN_MS = 1_000
const RECONNECT_MAX_MS = 30_000

type WorkerConfig = {
  apiOrigin: string
  apiToken: string
  convexSiteUrl: string
  guestJwt?: string
  workerSecret: string
}

type CaptureResult = { stored: boolean }

type FixtureSnapshotEntry = {
  fixtureId: number
  competition: string
  fixtureGroupId: number
  participant1: string
  participant2: string
  startsAt: string
}

type IngestionClient = {
  capture(record: RawCaptureRecord): Promise<CaptureResult>
  getCheckpoint(source: TxlineSource): Promise<string | null>
  syncFixtureSnapshot(fixtures: FixtureSnapshotEntry[]): Promise<{ stored: number }>
}

function requiredEnvironment(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} must be set for the TxLINE worker.`)
  }
  return value
}

function configFromEnvironment(): WorkerConfig {
  const apiOrigin = process.env.TXLINE_API_ORIGIN ?? MAINNET_API_ORIGIN
  if (apiOrigin !== MAINNET_API_ORIGIN) {
    throw new Error(
      `Ticket 03 is Mainnet-only; TXLINE_API_ORIGIN must be ${MAINNET_API_ORIGIN}.`
    )
  }

  return {
    apiOrigin,
    apiToken: requiredEnvironment("TXLINE_API_TOKEN"),
    convexSiteUrl: requiredEnvironment("CONVEX_SITE_URL").replace(/\/$/, ""),
    guestJwt: process.env.TXLINE_GUEST_JWT,
    workerSecret: requiredEnvironment("MATCHFLASH_WORKER_SECRET"),
  }
}

function convexIngestionClient(config: WorkerConfig): IngestionClient {
  const headers = {
    Authorization: `Bearer ${config.workerSecret}`,
  }

  async function responseJson(response: Response): Promise<unknown> {
    if (!response.ok) {
      throw new Error(
        `Convex worker ingress failed with HTTP ${response.status}: ${await response.text()}`
      )
    }
    return await response.json()
  }

  return {
    async capture(record) {
      const payload = await responseJson(
        await fetch(`${config.convexSiteUrl}/txline/ingest`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(record),
        })
      )
      if (
        typeof payload !== "object" ||
        payload === null ||
        typeof (payload as CaptureResult).stored !== "boolean"
      ) {
        throw new Error(
          "Convex worker ingress returned an invalid capture response."
        )
      }
      return payload as CaptureResult
    },
    async getCheckpoint(source) {
      const payload = await responseJson(
        await fetch(
          `${config.convexSiteUrl}/txline/checkpoint?source=${encodeURIComponent(source)}`,
          { headers }
        )
      )
      if (typeof payload !== "object" || payload === null) {
        throw new Error(
          "Convex worker ingress returned an invalid checkpoint response."
        )
      }
      const lastEventId = (payload as { lastEventId?: unknown }).lastEventId
      if (lastEventId !== null && typeof lastEventId !== "string") {
        throw new Error(
          "Convex worker ingress returned an invalid checkpoint value."
        )
      }
      return lastEventId ?? null
    },
    async syncFixtureSnapshot(fixtures) {
      const payload = await responseJson(
        await fetch(`${config.convexSiteUrl}/txline/fixtures/snapshot`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ fixtures }),
        })
      )
      if (
        typeof payload !== "object" ||
        payload === null ||
        typeof (payload as { stored?: unknown }).stored !== "number"
      ) {
        throw new Error("Convex worker ingress returned an invalid snapshot response.")
      }
      return payload as { stored: number }
    },
  }
}

class TxlineCredentials {
  private readonly apiOrigin: string
  private readonly apiToken: string
  private guestJwt?: string

  constructor(
    apiOrigin: string,
    apiToken: string,
    initialGuestJwt?: string
  ) {
    this.apiOrigin = apiOrigin
    this.apiToken = apiToken
    this.guestJwt = initialGuestJwt
  }

  async authorization(): Promise<string> {
    if (!this.guestJwt) {
      await this.renewGuestJwt()
    }
    return `Bearer ${this.guestJwt}`
  }

  async renewGuestJwt() {
    const response = await fetch(`${this.apiOrigin}/auth/guest/start`, {
      method: "POST",
    })
    if (!response.ok) {
      throw new Error(
        `TxLINE guest-session refresh failed with HTTP ${response.status}.`
      )
    }

    const body = (await response.json()) as { token?: unknown }
    if (typeof body.token !== "string" || body.token.length === 0) {
      throw new Error("TxLINE guest-session refresh returned no token.")
    }
    this.guestJwt = body.token
  }

  async headers(): Promise<Headers> {
    const headers = new Headers({
      Accept: "text/event-stream",
      "Accept-Encoding": "gzip",
      "X-Api-Token": this.apiToken,
    })
    headers.set("Authorization", await this.authorization())
    return headers
  }
}

function streamUrl(apiOrigin: string, source: TxlineSource): string {
  return `${apiOrigin}/api/${source}/stream`
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function snapshotEntries(payload: unknown): FixtureSnapshotEntry[] {
  if (!Array.isArray(payload)) {
    throw new Error("TxLINE fixture snapshot was not an array.")
  }

  const fixtures: FixtureSnapshotEntry[] = []
  for (const value of payload) {
    if (!isObject(value)) continue
    const fixtureId = value.FixtureId
    const competition = value.Competition
    const fixtureGroupId = value.FixtureGroupId
    const participant1 = value.Participant1
    const participant2 = value.Participant2
    const startsAt = value.StartTime
    if (
      typeof fixtureId !== "number" ||
      !Number.isFinite(fixtureId) ||
      typeof competition !== "string" ||
      typeof fixtureGroupId !== "number" ||
      !Number.isFinite(fixtureGroupId) ||
      typeof participant1 !== "string" ||
      typeof participant2 !== "string" ||
      typeof startsAt !== "string"
    ) {
      continue
    }
    fixtures.push({
      fixtureId,
      competition,
      fixtureGroupId,
      participant1,
      participant2,
      startsAt,
    })
  }

  if (fixtures.length === 0) {
    throw new Error("TxLINE fixture snapshot contained no usable fixtures.")
  }
  return fixtures
}

async function syncFixtureSnapshot(
  config: WorkerConfig,
  credentials: TxlineCredentials,
  ingestion: IngestionClient
) {
  const response = await fetch(`${config.apiOrigin}/api/fixtures/snapshot`, {
    headers: await credentials.headers(),
  })
  if (!response.ok) {
    throw new Error(`TxLINE fixture snapshot failed with HTTP ${response.status}.`)
  }
  const outcome = await ingestion.syncFixtureSnapshot(
    snapshotEntries(await response.json())
  )
  console.info(`[fixtures] synchronized ${outcome.stored} fixture records.`)
}

function reconnectDelay(attempt: number): number {
  return Math.min(RECONNECT_MIN_MS * 2 ** attempt, RECONNECT_MAX_MS)
}

function pause(milliseconds: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timeout = setTimeout(resolve, milliseconds)
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(timeout)
        resolve()
      },
      { once: true }
    )
  })
}

async function* readableChunks(
  stream: ReadableStream<Uint8Array>
): AsyncGenerator<Uint8Array> {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        return
      }
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}

async function consumeStream(
  source: TxlineSource,
  config: WorkerConfig,
  credentials: TxlineCredentials,
  ingestion: IngestionClient,
  signal: AbortSignal
) {
  let failures = 0

  while (!signal.aborted) {
    try {
      const headers = await credentials.headers()
      const checkpoint = await ingestion.getCheckpoint(source)
      if (checkpoint) {
        headers.set("Last-Event-ID", checkpoint)
      }

      const response = await fetch(streamUrl(config.apiOrigin, source), {
        headers,
        signal,
      })
      if (response.status === 401) {
        await credentials.renewGuestJwt()
        continue
      }
      if (!response.ok || !response.body) {
        throw new Error(`${source} stream failed with HTTP ${response.status}.`)
      }

      failures = 0
      console.info(
        `[${source}] connected to TxLINE SSE stream${checkpoint ? ` from checkpoint ${checkpoint}` : ""}.`
      )
      for await (const event of parseSseAsync(readableChunks(response.body))) {
        if (shouldIgnoreSseEvent(event)) {
          continue
        }

        const record = createCaptureRecord(source, event)
        const outcome = await ingestion.capture(record)
        if (outcome.stored) {
          console.info(`[${source}] captured ${record.sourceEventId}`)
        }
      }

      if (!signal.aborted) {
        throw new Error(`${source} stream ended unexpectedly.`)
      }
    } catch (error) {
      if (signal.aborted) {
        break
      }
      const delay = reconnectDelay(failures)
      failures += 1
      console.error(`[${source}] ${String(error)} Reconnecting in ${delay}ms.`)
      await pause(delay, signal)
    }
  }
}

export async function runWorker(config = configFromEnvironment()) {
  const controller = new AbortController()
  const stop = () => controller.abort()
  process.once("SIGINT", stop)
  process.once("SIGTERM", stop)

  const credentials = new TxlineCredentials(
    config.apiOrigin,
    config.apiToken,
    config.guestJwt
  )
  const ingestion = convexIngestionClient(config)

  try {
    await syncFixtureSnapshot(config, credentials, ingestion)
  } catch (error) {
    console.error(`[fixtures] ${String(error)} Continuing with score and odds capture.`)
  }

  console.info("Starting TxLINE Mainnet level-12 capture worker.")
  await Promise.all([
    consumeStream("scores", config, credentials, ingestion, controller.signal),
    consumeStream("odds", config, credentials, ingestion, controller.signal),
  ])
}

if (process.argv[1]?.endsWith("txline-worker.ts")) {
  void runWorker().catch((error: unknown) => {
    console.error(error)
    process.exitCode = 1
  })
}
