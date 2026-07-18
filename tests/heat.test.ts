import assert from "node:assert/strict"
import test from "node:test"

import {
  applyActivityContribution,
  applyFlashContribution,
  applyPossessionContribution,
  heatForDisplay,
  shouldApplyActivityContribution,
  shouldApplyPossessionContribution,
} from "../lib/heat.ts"

test("Heat decays before a confirmed Flash Card contribution is added", () => {
  const updated = applyFlashContribution(
    { heat: 40, heatUpdatedAt: 0 },
    60,
    6 * 60_000
  )

  assert.deepEqual(updated, { heat: 38, heatUpdatedAt: 6 * 60_000 })
})

test("Heat activity and possession contributions stay bounded and throttled", () => {
  const state = { heat: 10, heatUpdatedAt: 100_000 }

  assert.equal(shouldApplyActivityContribution(state, 119_999), false)
  assert.equal(shouldApplyActivityContribution(state, 120_000), true)
  assert.equal(
    applyActivityContribution(state, 100, 120_000).heat,
    24.622238368941453
  )

  assert.equal(shouldApplyPossessionContribution(100_000, 119_999), false)
  assert.equal(shouldApplyPossessionContribution(100_000, 120_000), true)
  assert.equal(
    applyPossessionContribution(state, 100, 120_000).heat,
    19.622238368941453
  )
})

test("Heat is bounded only for presentation", () => {
  assert.equal(heatForDisplay(-3), 0)
  assert.equal(heatForDisplay(37.6), 38)
  assert.equal(heatForDisplay(180), 100)
})
