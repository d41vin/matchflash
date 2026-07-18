import { parseSseAsync, shouldIgnoreSseEvent } from "./txline-protocol.ts"

const API_ORIGIN = "https://txline-dev.txodds.com"
const PROBE_TIMEOUT_MS = 15_000

function requiredEnvironment(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} must be set in .env.txline-devnet.`)
  return value
}

async function guestJwt() {
  const response = await fetch(`${API_ORIGIN}/auth/guest/start`, {
    method: "POST",
  })
  const payload = (await response.json()) as { token?: unknown }
  if (
    !response.ok ||
    typeof payload.token !== "string" ||
    payload.token.length === 0
  ) {
    throw new Error("TxLINE Devnet did not return a guest JWT.")
  }
  return payload.token
}

async function* chunks(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) return
      yield value
    }
  } finally {
    reader.releaseLock()
  }
}

async function probe(source: "scores" | "odds", jwt: string, apiToken: string) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS)
  try {
    const response = await fetch(`${API_ORIGIN}/api/${source}/stream`, {
      headers: {
        Accept: "text/event-stream",
        Authorization: `Bearer ${jwt}`,
        "X-Api-Token": apiToken,
      },
      signal: controller.signal,
    })
    if (!response.ok || !response.body) {
      throw new Error(`${source} stream returned HTTP ${response.status}.`)
    }
    console.info(
      `[${source}] connected (${response.headers.get("content-type") ?? "unknown content type"}).`
    )
    for await (const event of parseSseAsync(chunks(response.body))) {
      if (shouldIgnoreSseEvent(event)) continue
      console.info(
        `[${source}] received a non-heartbeat event (${event.data.length} bytes).`
      )
      return
    }
    console.info(
      `[${source}] connected; no non-heartbeat event arrived within 15 seconds.`
    )
  } catch (cause) {
    if (controller.signal.aborted) {
      console.info(
        `[${source}] connected; no non-heartbeat event arrived within 15 seconds.`
      )
      return
    }
    throw cause
  } finally {
    clearTimeout(timeout)
  }
}

async function main() {
  const apiToken = requiredEnvironment("TXLINE_API_TOKEN")
  const jwt = await guestJwt()
  await Promise.all([
    probe("scores", jwt, apiToken),
    probe("odds", jwt, apiToken),
  ])
}

void main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
