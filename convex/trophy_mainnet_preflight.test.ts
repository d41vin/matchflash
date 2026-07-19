import { expect, test } from "vitest"

import {
  MAINNET_TROPHY_TREE_CONFIG,
  mainnetTrophyTreePreflight,
} from "./trophy_mainnet_preflight"

test("preflights the fixed private 32-leaf Bubblegum V2 tree", () => {
  expect(mainnetTrophyTreePreflight(28_000_000)).toEqual({
    ...MAINNET_TROPHY_TREE_CONFIG,
    accountSizeBytes: 3864,
    rentExemptLamports: "28000000",
  })
})
