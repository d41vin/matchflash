import { expect, test } from "vitest"

import {
  SOLANA_MAINNET_GENESIS_HASH,
  isSolanaMainnetGenesisHash,
  MAINNET_TROPHY_TREE_CONFIG,
  mainnetTrophyTreePreflight,
} from "./trophy_mainnet_preflight"

test("recognizes the complete Solana Mainnet genesis hash", () => {
  expect(SOLANA_MAINNET_GENESIS_HASH).toBe(
    "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d"
  )
  expect(isSolanaMainnetGenesisHash(SOLANA_MAINNET_GENESIS_HASH)).toBe(true)
  expect(isSolanaMainnetGenesisHash("5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp")).toBe(
    false
  )
})

test("preflights the fixed private 32-leaf Bubblegum V2 tree", () => {
  expect(mainnetTrophyTreePreflight(28_000_000)).toEqual({
    ...MAINNET_TROPHY_TREE_CONFIG,
    accountSizeBytes: 3864,
    rentExemptLamports: "28000000",
  })
})
