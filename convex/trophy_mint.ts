"use node"

import type { DasApiInterface } from "@metaplex-foundation/digital-asset-standard-api"
import {
  createTreeV2,
  findLeafAssetIdPda,
  getAssetWithProof,
  mintV2,
  mplBubblegum,
  setNonTransferableV2,
} from "@metaplex-foundation/mpl-bubblegum"
import {
  createCollection,
  mplCore,
} from "@metaplex-foundation/mpl-core"
import {
  generateSigner,
  keypairIdentity,
  publicKey,
  some,
} from "@metaplex-foundation/umi"
import { base58 } from "@metaplex-foundation/umi/serializers"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { v } from "convex/values"

import { internal } from "./_generated/api"
import type { Doc } from "./_generated/dataModel"
import { env, internalAction, type ActionCtx } from "./_generated/server"

type ClaimReservation = Doc<"trophyClaims"> & {
  fixture: Doc<"fixtures">
  matchState: Doc<"matchStates">
  user: Doc<"users">
}
type SecuringReservation = Doc<"trophyClaims"> & { mintAddress: string }

const DEVNET_TREE_CONFIG = {
  capacity: 32,
  maxDepth: 5,
  maxBufferSize: 8,
  canopyDepth: 5,
} as const

function serializableError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500)
  return "The Devnet trophy mint could not be completed."
}

function devnetAuthority() {
  if (env.MATCHFLASH_TROPHY_NETWORK !== "devnet") {
    throw new Error("Digital Trophy minting is configured for Devnet only.")
  }
  if (
    !env.MATCHFLASH_TROPHY_RPC_URL ||
    !env.MATCHFLASH_TROPHY_AUTHORITY_SECRET_KEY
  ) {
    throw new Error("The Devnet Digital Trophy mint is not configured.")
  }

  let secretKey: unknown
  try {
    secretKey = JSON.parse(env.MATCHFLASH_TROPHY_AUTHORITY_SECRET_KEY)
  } catch {
    try {
      secretKey = base58.serialize(
        env.MATCHFLASH_TROPHY_AUTHORITY_SECRET_KEY.trim()
      )
    } catch {
      throw new Error(
        "The Devnet trophy authority key must be a 64-byte JSON array or Phantom base58 private key."
      )
    }
  }
  if (secretKey instanceof Uint8Array) secretKey = Array.from(secretKey)
  if (
    !Array.isArray(secretKey) ||
    secretKey.length !== 64 ||
    secretKey.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)
  ) {
    throw new Error("The Devnet trophy authority key must contain 64 bytes.")
  }

  const umi = createUmi(env.MATCHFLASH_TROPHY_RPC_URL)
    .use(mplBubblegum())
    .use(mplCore())
  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(secretKey)
  )
  return umi.use(keypairIdentity(keypair))
}

function dasCompatibleUmi(umi: ReturnType<typeof devnetAuthority>) {
  // DAS uses named JSON-RPC params, whereas Umi's Web3.js RPC bridge emits
  // positional arrays. Keep the two DAS reads at this narrow boundary.
  async function dasRequest<T>(method: string, params: Record<string, unknown>) {
    const response = await fetch(umi.rpc.getEndpoint(), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: method, method, params }),
    })
    const payload = (await response.json()) as {
      result?: T
      error?: { message?: string }
    }
    if (!response.ok || payload.error || !payload.result) {
      throw new Error(payload.error?.message ?? `DAS ${method} failed.`)
    }
    return payload.result
  }

  const dasRpc: DasApiInterface = {
    getAsset: async (input) => {
      const assetId =
        typeof input === "object" && "assetId" in input
          ? input.assetId
          : input
      const displayOptions =
        typeof input === "object" && "displayOptions" in input
          ? input.displayOptions
          : {}
      return await dasRequest("getAsset", {
        id: assetId,
        options: displayOptions,
      })
    },
    getAssetProof: async (assetId) =>
      await dasRequest("getAssetProof", { id: assetId }),
  } as DasApiInterface
  return { ...umi, rpc: { ...umi.rpc, ...dasRpc } } as typeof umi & {
    rpc: DasApiInterface
  }
}

function collectionMetadata() {
  return JSON.stringify({
    name: "MatchFlash Digital Trophy Collection",
    description:
      "Free, non-transferable MatchFlash commemorative trophies for live participation.",
    image:
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjYzMCI+PHJlY3Qgd2lkdGg9IjEyMDAiIGhlaWdodD0iNjMwIiBmaWxsPSIjMDIwNjE3Ii8+PHRleHQgeD0iNjAwIiB5PSIzMjAiIGZpbGw9IiM2N2U4ZjkiIGZvbnQtc2l6ZT0iNjQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+TUFUQ0hGTEFTSDwvdGV4dD48L3N2Zz4=",
  })
}

export const provisionDevnetTree = internalAction({
  args: {},
  handler: async (ctx): Promise<null> => {
    const activeTree: Doc<"merkleTrees"> | null = await ctx.runQuery(
      internal.trophies.getActiveTree,
      {}
    )
    if (activeTree) return null

    const metadataStorageId = await ctx.storage.store(
      new Blob([collectionMetadata()], { type: "application/json" })
    )
    const metadataUrl = await ctx.storage.getUrl(metadataStorageId)
    if (!metadataUrl)
      throw new Error("Digital Trophy collection metadata could not be published.")

    const umi = devnetAuthority()
    // Bubblegum V2 calculates this same account size before creating the
    // tree. We obtain the exact current rent first so the action result is an
    // auditable Devnet preflight rather than a hidden spend.
    const treeRentLamports = await umi.rpc.getRent(3864)
    const collection = generateSigner(umi)
    const merkleTree = generateSigner(umi)

    const collectionTx = await createCollection(umi, {
      collection,
      updateAuthority: umi.identity.publicKey,
      name: "MatchFlash Digital Trophy Collection",
      uri: metadataUrl,
      plugins: [
        { type: "BubblegumV2" },
        {
          type: "PermanentFreezeDelegate",
          frozen: true,
          authority: { type: "UpdateAuthority" },
        },
      ],
    }).sendAndConfirm(umi)

    const treeTx = await (
      await createTreeV2(umi, {
        merkleTree,
        maxDepth: DEVNET_TREE_CONFIG.maxDepth,
        maxBufferSize: DEVNET_TREE_CONFIG.maxBufferSize,
        canopyDepth: DEVNET_TREE_CONFIG.canopyDepth,
        public: false,
      })
    ).sendAndConfirm(umi)

    await ctx.runMutation(
      internal.trophies.registerDevnetTree,
      {
      treeAddress: merkleTree.publicKey,
      collectionAddress: collection.publicKey,
      capacity: DEVNET_TREE_CONFIG.capacity,
      treeRentLamports: treeRentLamports.toString(),
      collectionTransactionSignature: Buffer.from(collectionTx.signature).toString(
        "base64"
      ),
      treeTransactionSignature: Buffer.from(treeTx.signature).toString("base64"),
      }
    )
    return null
  },
})

function trophyMetadata(reservation: ClaimReservation) {
  const date = new Date(reservation.fixture.startsAt).toISOString().slice(0, 10)
  const score = `${reservation.matchState.score1}-${reservation.matchState.score2}`
  const image = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#020617"/><rect x="48" y="48" width="1104" height="534" rx="40" fill="#0f172a" stroke="#67e8f9" stroke-width="3"/><text x="600" y="190" fill="#a5f3fc" font-family="Arial, sans-serif" font-size="34" text-anchor="middle" letter-spacing="8">MATCHFLASH</text><text x="600" y="286" fill="#ffffff" font-family="Arial, sans-serif" font-size="56" font-weight="700" text-anchor="middle">DIGITAL TROPHY</text><text x="600" y="372" fill="#cbd5e1" font-family="Arial, sans-serif" font-size="36" text-anchor="middle">${reservation.fixture.participant1} ${score} ${reservation.fixture.participant2}</text><text x="600" y="444" fill="#94a3b8" font-family="Arial, sans-serif" font-size="28" text-anchor="middle">${date}</text></svg>`,
    "utf8"
  ).toString("base64")

  return JSON.stringify({
    name: "MatchFlash Digital Trophy",
    symbol: "MFLASH",
    description:
      "A free, non-transferable MatchFlash commemorative trophy for live participation.",
    image: `data:image/svg+xml;base64,${image}`,
    attributes: [
      {
        trait_type: "Teams",
        value: `${reservation.fixture.participant1} v ${reservation.fixture.participant2}`,
      },
      { trait_type: "Competition", value: reservation.fixture.competition },
      { trait_type: "Final score", value: score },
      { trait_type: "Date", value: date },
      { trait_type: "MatchFlash claim", value: "Live participant" },
    ],
  })
}

async function secureMint(ctx: ActionCtx, claim: SecuringReservation) {
  const umi = devnetAuthority()
  const merkleTree = publicKey(claim.treeAddress)
  const coreCollection = publicKey(claim.collectionAddress)
  const mintAddress = publicKey(claim.mintAddress)
  const dasEnabledUmi = dasCompatibleUmi(umi)
  const asset = await getAssetWithProof(dasEnabledUmi, mintAddress, {
    truncateCanopy: true,
  })
  const soulbound = await setNonTransferableV2(umi, {
    ...asset,
    authority: umi.identity,
    coreCollection,
  }).sendAndConfirm(umi)
  await ctx.runMutation(internal.trophies.markSoulbound, {
    claimId: claim._id,
    mintAddress,
    transactionSignature: Buffer.from(soulbound.signature).toString("base64"),
  })
}

export const mintReserved = internalAction({
  args: { claimId: v.id("trophyClaims") },
  handler: async (ctx, args) => {
    const reservation: ClaimReservation | null = await ctx.runQuery(
      internal.trophies.getReservation,
      { claimId: args.claimId }
    )
    if (!reservation) return

    try {
      const metadataStorageId = await ctx.storage.store(
        new Blob([trophyMetadata(reservation)], { type: "application/json" })
      )
      const metadataUrl = await ctx.storage.getUrl(metadataStorageId)
      if (!metadataUrl)
        throw new Error("Digital Trophy metadata could not be published.")

      const umi = devnetAuthority()
      const merkleTree = publicKey(reservation.treeAddress)
      const coreCollection = publicKey(reservation.collectionAddress)
      const leafOwner = publicKey(reservation.user.walletAddress)
      const minted = await mintV2(umi, {
        collectionAuthority: umi.identity,
        leafOwner,
        merkleTree,
        coreCollection,
        metadata: {
          name: "MatchFlash Digital Trophy",
          symbol: "MFLASH",
          uri: metadataUrl,
          sellerFeeBasisPoints: 0,
          creators: [],
          collection: some(coreCollection),
        },
      }).sendAndConfirm(umi)

      const [mintAddress] = findLeafAssetIdPda(umi, {
        merkleTree,
        leafIndex: reservation.leafIndex,
      })
      await ctx.runMutation(internal.trophies.markMinted, {
        claimId: args.claimId,
        mintAddress,
        metadataStorageId,
        metadataUrl,
        transactionSignature: Buffer.from(minted.signature).toString("base64"),
      })
      const soulboundReservation = await ctx.runQuery(
        internal.trophies.getSecuringReservation,
        {
          claimId: args.claimId,
        }
      )
      if (!soulboundReservation?.mintAddress)
        throw new Error("Digital Trophy soulbound state was not recorded.")
      await secureMint(ctx, {
        ...soulboundReservation,
        mintAddress: soulboundReservation.mintAddress,
      })
    } catch (error) {
      await ctx.runMutation(internal.trophies.markFailed, {
        claimId: args.claimId,
        failureMessage: serializableError(error),
      })
    }
  },
})

export const secureMinted = internalAction({
  args: { claimId: v.id("trophyClaims") },
  handler: async (ctx, args) => {
    const claim = await ctx.runQuery(internal.trophies.getSecuringReservation, {
      claimId: args.claimId,
    })
    if (!claim?.mintAddress) return
    try {
      await secureMint(ctx, { ...claim, mintAddress: claim.mintAddress })
    } catch (error) {
      await ctx.runMutation(internal.trophies.markFailed, {
        claimId: args.claimId,
        failureMessage: serializableError(error),
      })
    }
  },
})
