import { createHash } from "node:crypto"

export type TxlineSource = "scores" | "odds"

export type SseEvent = {
  data: string
  event?: string
  // Present only when this frame carries a new SSE id. It is safe to use as
  // the delivery identity for deduplication.
  id?: string
  // The most recent SSE id, including one inherited from an earlier frame.
  // It is a resume checkpoint, not necessarily a source-event identity.
  lastEventId?: string
}

export type RawCaptureRecord = {
  source: TxlineSource
  sourceEventId: string
  sseEventId?: string
  fixtureId?: number
  eventType: string
  sequence?: number
  occurredAt?: number
  raw: unknown
}

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function numberAt(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function stringAt(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function objectAt(value: JsonObject, key: string): JsonObject | undefined {
  const candidate = value[key]
  return isObject(candidate) ? candidate : undefined
}

function firstNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    const number = numberAt(value)
    if (number !== undefined) {
      return number
    }
  }

  return undefined
}

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    const string = stringAt(value)
    if (string !== undefined) {
      return string
    }
  }

  return undefined
}

function parseJson(data: string): unknown {
  try {
    return JSON.parse(data) as unknown
  } catch {
    return { unparsedData: data }
  }
}

function fallbackEventId(source: TxlineSource, event: SseEvent): string {
  // If TxLINE omits every event-level identity, the raw payload plus the last
  // durable SSE checkpoint is the strongest replay-safe identity available.
  // Byte-identical frames at that point are observationally indistinguishable,
  // so treating them as duplicate delivery is safer than creating two records.
  return `fallback:${createHash("sha256")
    .update(source)
    .update("\u0000")
    .update(event.lastEventId ?? "")
    .update("\u0000")
    .update(event.data)
    .digest("hex")}`
}

export function shouldIgnoreSseEvent(event: SseEvent): boolean {
  if (event.event?.toLowerCase() === "heartbeat") {
    return true
  }

  if (event.data.trim().length === 0) {
    return true
  }

  const payload = parseJson(event.data)
  if (!isObject(payload)) {
    return false
  }

  const type = firstString(
    payload.type,
    payload.Type,
    payload.event,
    payload.Event
  )
  return type?.toLowerCase() === "heartbeat"
}

export function createCaptureRecord(
  source: TxlineSource,
  event: SseEvent
): RawCaptureRecord {
  const raw = parseJson(event.data)
  const payload = isObject(raw) ? raw : undefined
  const fixtureInfo = payload ? objectAt(payload, "FixtureInfo") : undefined
  const update = payload ? objectAt(payload, "Update") : undefined

  const fixtureId = firstNumber(
    payload?.FixtureId,
    fixtureInfo?.FixtureId,
    update?.FixtureId,
    payload?.fixtureId
  )
  const providerMessageId = firstString(
    payload?.MessageId,
    payload?.messageId,
    update?.MessageId,
    update?.messageId
  )
  const updateId = firstNumber(update?.Id, payload?.Id)
  const sequence = firstNumber(update?.Seq, payload?.Seq, payload?.GlobalSeq)
  const occurredAt = firstNumber(update?.Ts, payload?.Ts, payload?.Timestamp)
  const eventType =
    firstString(update?.Action, payload?.Action, payload?.Type, event.event) ??
    "message"
  const sourceEventId =
    event.id ??
    providerMessageId ??
    (sequence !== undefined
      ? `${fixtureId ?? "unknown"}:seq:${sequence}`
      : undefined) ??
    (updateId !== undefined
      ? `${fixtureId ?? "unknown"}:${eventType}:${updateId}:${occurredAt ?? "unknown"}`
      : undefined) ??
    fallbackEventId(source, event)

  return {
    source,
    sourceEventId,
    ...(event.lastEventId ? { sseEventId: event.lastEventId } : {}),
    ...(fixtureId !== undefined ? { fixtureId } : {}),
    eventType,
    ...(sequence !== undefined ? { sequence } : {}),
    ...(occurredAt !== undefined ? { occurredAt } : {}),
    raw,
  }
}

class SseParser {
  private readonly decoder = new TextDecoder()
  private buffer = ""
  private event: Omit<SseEvent, "data"> & { data: string[] } = { data: [] }
  private lastEventId?: string

  private flush(): SseEvent | undefined {
    if (this.event.data.length === 0) {
      this.event = { data: [] }
      return undefined
    }

    const parsed: SseEvent = {
      ...("id" in this.event ? { id: this.event.id } : {}),
      ...(this.lastEventId ? { lastEventId: this.lastEventId } : {}),
      ...("event" in this.event ? { event: this.event.event } : {}),
      data: this.event.data.join("\n"),
    }
    this.event = { data: [] }
    return parsed
  }

  private consumeLine(line: string): SseEvent | undefined {
    if (line.length === 0) {
      return this.flush()
    }
    if (line.startsWith(":")) {
      return undefined
    }

    const separator = line.indexOf(":")
    const field = separator === -1 ? line : line.slice(0, separator)
    const value =
      separator === -1 ? "" : line.slice(separator + 1).replace(/^ /, "")

    if (field === "data") {
      this.event.data.push(value)
    } else if (field === "id") {
      this.lastEventId = value
      this.event.id = value
    } else if (field === "event") {
      this.event.event = value
    }

    return undefined
  }

  push(chunk: Uint8Array): SseEvent[] {
    const events: SseEvent[] = []
    this.buffer += this.decoder
      .decode(chunk, { stream: true })
      .replace(/\r\n/g, "\n")
    let lineEnd = this.buffer.indexOf("\n")
    while (lineEnd !== -1) {
      const parsed = this.consumeLine(this.buffer.slice(0, lineEnd))
      if (parsed) {
        events.push(parsed)
      }
      this.buffer = this.buffer.slice(lineEnd + 1)
      lineEnd = this.buffer.indexOf("\n")
    }
    return events
  }

  finish(): SseEvent[] {
    const events: SseEvent[] = []
    this.buffer += this.decoder.decode().replace(/\r\n/g, "\n")
    if (this.buffer.length > 0) {
      const parsed = this.consumeLine(this.buffer)
      if (parsed) {
        events.push(parsed)
      }
    }
    const parsed = this.flush()
    if (parsed) {
      events.push(parsed)
    }
    return events
  }
}

export function* parseSse(chunks: Iterable<Uint8Array>): Generator<SseEvent> {
  const parser = new SseParser()
  for (const chunk of chunks) {
    yield* parser.push(chunk)
  }
  yield* parser.finish()
}

export async function* parseSseAsync(
  chunks: AsyncIterable<Uint8Array>
): AsyncGenerator<SseEvent> {
  const parser = new SseParser()
  for await (const chunk of chunks) {
    yield* parser.push(chunk)
  }
  yield* parser.finish()
}
