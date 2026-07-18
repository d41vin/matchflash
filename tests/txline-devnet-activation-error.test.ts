import assert from "node:assert/strict"
import test from "node:test"

import { txlineDevnetActivationError } from "../lib/txline-devnet-activation-error.ts"

test("reports a safe upstream activation failure detail", () => {
  assert.equal(
    txlineDevnetActivationError(403, { error: "Invalid wallet signature" }),
    "TxLINE Devnet activation failed upstream (HTTP 403): Invalid wallet signature"
  )
})

test("does not serialize arbitrary upstream response fields", () => {
  assert.equal(
    txlineDevnetActivationError(500, { token: "must-not-be-disclosed" }),
    "TxLINE Devnet activation failed upstream (HTTP 500)"
  )
})
