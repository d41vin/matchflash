import assert from "node:assert/strict"
import test from "node:test"

import {
  createCaptureRecord,
  parseSse,
  shouldIgnoreSseEvent,
} from "../workers/txline-protocol.ts"

test("parses chunked SSE frames including multiline data and a resume id", () => {
  const frames = [
    ...parseSse(
      [
        "id: score-17\n",
        'event: update\ndata: {"FixtureInfo":{"FixtureId":42},\n',
        'data: "Update":{"Action":"goal","Id":7,"Seq":19,"Ts":123}}\n\n',
      ].map((value) => new TextEncoder().encode(value))
    ),
  ]

  assert.deepEqual(frames, [
    {
      id: "score-17",
      event: "update",
      lastEventId: "score-17",
      data: '{"FixtureInfo":{"FixtureId":42},\n"Update":{"Action":"goal","Id":7,"Seq":19,"Ts":123}}',
    },
  ])
})

test("keeps the latest SSE id as a checkpoint without reusing it as an event id", () => {
  const frames = [
    ...parseSse(
      ["id: score-17\ndata: first\n\ndata: second\n\n"].map((value) =>
        new TextEncoder().encode(value)
      )
    ),
  ]

  assert.deepEqual(frames, [
    { id: "score-17", lastEventId: "score-17", data: "first" },
    { lastEventId: "score-17", data: "second" },
  ])
})

test("builds a raw score capture from the stream identity without classifying it", () => {
  const record = createCaptureRecord("scores", {
    id: "score-17",
    lastEventId: "score-17",
    event: "update",
    data: JSON.stringify({
      FixtureInfo: { FixtureId: 42 },
      Update: {
        Action: "goal",
        Confirmed: true,
        Id: 7,
        Seq: 19,
        Ts: 123,
      },
    }),
  })

  assert.deepEqual(record, {
    source: "scores",
    sourceEventId: "score-17",
    sseEventId: "score-17",
    fixtureId: 42,
    eventType: "goal",
    sequence: 19,
    occurredAt: 123,
    raw: {
      FixtureInfo: { FixtureId: 42 },
      Update: {
        Action: "goal",
        Confirmed: true,
        Id: 7,
        Seq: 19,
        Ts: 123,
      },
    },
  })
})

test("uses a provider message identity when a stream frame has no SSE id", () => {
  const frame = {
    event: "odds",
    data: JSON.stringify({ FixtureId: 42, MessageId: "provider-9", Pct: 0.62 }),
  }

  const record = createCaptureRecord("odds", frame)

  assert.equal(record.sourceEventId, "provider-9")
  assert.equal(record.fixtureId, 42)
})

test("deduplicates an identity-less frame with its checkpoint-scoped fingerprint", () => {
  const frame = {
    event: "status",
    lastEventId: "score-17",
    data: '{"FixtureId":42,"Status":"live"}',
  }

  const first = createCaptureRecord("scores", frame)
  const replayed = createCaptureRecord("scores", frame)

  assert.equal(first.sourceEventId, replayed.sourceEventId)
  assert.equal(first.sseEventId, "score-17")
})

test("filters only heartbeat frames before the raw capture boundary", () => {
  assert.equal(shouldIgnoreSseEvent({ event: "heartbeat", data: "" }), true)
  assert.equal(shouldIgnoreSseEvent({ data: '{"type":"heartbeat"}' }), true)
  assert.equal(
    shouldIgnoreSseEvent({
      event: "update",
      data: '{"Update":{"Action":"goal"}}',
    }),
    false
  )
})
