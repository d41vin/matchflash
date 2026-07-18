import assert from "node:assert/strict"
import test from "node:test"

import { txlineDevnetActivationPayload } from "../lib/txline-devnet-activation-response.ts"

test("preserves TxLINE's plain-text activated API token", () => {
  assert.equal(txlineDevnetActivationPayload("activated-api-token"), "activated-api-token")
})

test("parses a JSON activation response when TxLINE returns one", () => {
  assert.deepEqual(txlineDevnetActivationPayload('{"token":"api-token"}'), {
    token: "api-token",
  })
})
