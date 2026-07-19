import { getMerkleTreeSize } from "@metaplex-foundation/mpl-account-compression"

export const MAINNET_TROPHY_TREE_CONFIG = {
  capacity: 32,
  maxDepth: 5,
  maxBufferSize: 8,
  canopyDepth: 5,
  public: false,
} as const

export function mainnetTrophyTreePreflight(rentExemptLamports: {
  toString(): string
}) {
  return {
    ...MAINNET_TROPHY_TREE_CONFIG,
    accountSizeBytes: getMerkleTreeSize(
      MAINNET_TROPHY_TREE_CONFIG.maxDepth,
      MAINNET_TROPHY_TREE_CONFIG.maxBufferSize,
      MAINNET_TROPHY_TREE_CONFIG.canopyDepth
    ),
    rentExemptLamports: rentExemptLamports.toString(),
  }
}
