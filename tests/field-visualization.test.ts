import assert from "node:assert/strict"
import test from "node:test"

import { fieldReactionFor } from "../lib/field-visualization.ts"

test("the phase-one field maps only supported classified moments to honest zones", () => {
  assert.deepEqual(fieldReactionFor({ type: "goal", participant: 1 }), {
    label: "Goal moment",
    zone: "goal",
    team: 1,
  })
  assert.deepEqual(fieldReactionFor({ type: "corner", participant: 2 }), {
    label: "Corner moment",
    zone: "corner",
    team: 2,
  })
  assert.deepEqual(fieldReactionFor({ type: "varReview" }), {
    label: "VAR review",
    zone: "border",
  })
  assert.equal(fieldReactionFor({ type: "phaseChange" }), null)
})
