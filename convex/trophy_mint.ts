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
import { createCollection, mplCore } from "@metaplex-foundation/mpl-core"
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
import type { Doc, Id } from "./_generated/dataModel"
import { env, internalAction, type ActionCtx } from "./_generated/server"
import {
  MAINNET_TROPHY_TREE_CONFIG,
  mainnetTrophyTreePreflight,
} from "./trophy_mainnet_preflight"

type ClaimReservation = Doc<"trophyClaims"> & {
  fixture: Doc<"fixtures">
  matchState: Doc<"matchStates">
  user: Doc<"users">
}
type SecuringReservation = Doc<"trophyClaims"> & { mintAddress: string }
type MainnetTreePreflight = ReturnType<typeof mainnetTrophyTreePreflight>
type ProvisionedMainnetTree = MainnetTreePreflight & {
  treeAddress: string
  collectionAddress: string
  collectionTransactionSignature: string
  treeTransactionSignature: string
}

const MAINNET_GENESIS_HASH = "5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp"
const MAINNET_TREE_CREATION_APPROVAL = "CREATE_MAINNET_TROPHY_TREE"

function serializableError(error: unknown) {
  if (error instanceof Error) return error.message.slice(0, 500)
  return "The Mainnet trophy mint could not be completed."
}

function mainnetUmi() {
  if (env.MATCHFLASH_TROPHY_NETWORK !== "mainnet") {
    throw new Error("Digital Trophy minting is configured for Mainnet only.")
  }
  if (!env.MATCHFLASH_TROPHY_RPC_URL) {
    throw new Error("The Mainnet Digital Trophy RPC is not configured.")
  }

  return createUmi(env.MATCHFLASH_TROPHY_RPC_URL)
    .use(mplBubblegum())
    .use(mplCore())
}

async function mainnetTreePreflight() {
  const umi = mainnetUmi()
  const accountSizeBytes = mainnetTrophyTreePreflight(0).accountSizeBytes
  await assertMainnetRpc(umi)
  await assertDasCapability(umi)
  const rentExemptLamports = await umi.rpc.getRent(accountSizeBytes)
  return mainnetTrophyTreePreflight(rentExemptLamports.basisPoints)
}

async function assertMainnetRpc(umi: ReturnType<typeof mainnetUmi>) {
  if ((await umi.rpc.getGenesisHash()) !== MAINNET_GENESIS_HASH) {
    throw new Error(
      "MATCHFLASH_TROPHY_RPC_URL must target Solana Mainnet before a trophy transaction can be submitted."
    )
  }
}

async function dasRequest<T>(
  umi: ReturnType<typeof mainnetUmi>,
  method: string,
  params: Record<string, unknown>
) {
  const response = await fetch(umi.rpc.getEndpoint(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: method, method, params }),
  })
  const payload = (await response.json()) as {
    result?: T
    error?: { message?: string }
  }
  if (!response.ok || payload.error || payload.result === undefined) {
    throw new Error(payload.error?.message ?? `DAS ${method} failed.`)
  }
  return payload.result
}

async function assertDasCapability(umi: ReturnType<typeof mainnetUmi>) {
  await dasRequest(umi, "getAssetsByOwner", {
    ownerAddress: "11111111111111111111111111111111",
    page: 1,
    limit: 1,
  })
}

function mainnetAuthority() {
  if (!env.MATCHFLASH_TROPHY_AUTHORITY_SECRET_KEY) {
    throw new Error("The Mainnet Digital Trophy authority is not configured.")
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
        "The Mainnet trophy authority key must be a 64-byte JSON array or Phantom base58 private key."
      )
    }
  }
  if (secretKey instanceof Uint8Array) secretKey = Array.from(secretKey)
  if (
    !Array.isArray(secretKey) ||
    secretKey.length !== 64 ||
    secretKey.some((byte) => !Number.isInteger(byte) || byte < 0 || byte > 255)
  ) {
    throw new Error("The Mainnet trophy authority key must contain 64 bytes.")
  }

  const umi = mainnetUmi()
  const keypair = umi.eddsa.createKeypairFromSecretKey(
    new Uint8Array(secretKey)
  )
  return umi.use(keypairIdentity(keypair))
}

function dasCompatibleUmi(umi: ReturnType<typeof mainnetAuthority>) {
  // DAS uses named JSON-RPC params, whereas Umi's Web3.js RPC bridge emits
  // positional arrays. Keep the two DAS reads at this narrow boundary.
  const dasRpc: DasApiInterface = {
    getAsset: async (input) => {
      const assetId =
        typeof input === "object" && "assetId" in input ? input.assetId : input
      const displayOptions =
        typeof input === "object" && "displayOptions" in input
          ? input.displayOptions
          : {}
      return await dasRequest(umi, "getAsset", {
        id: assetId,
        options: displayOptions,
      })
    },
    getAssetProof: async (assetId) =>
      await dasRequest(umi, "getAssetProof", { id: assetId }),
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

export const preflightMainnetTree = internalAction({
  args: {},
  handler: async (
    ctx
  ): Promise<
    MainnetTreePreflight & { preflightId: Id<"trophyTreePreflights"> }
  > => {
    const preflight = await mainnetTreePreflight()
    const preflightId: Id<"trophyTreePreflights"> = await ctx.runMutation(
      internal.trophies.createMainnetTreePreflight,
      {
        accountSizeBytes: preflight.accountSizeBytes,
        rentExemptLamports: preflight.rentExemptLamports,
      }
    )
    console.log("Mainnet Digital Trophy tree preflight", preflight)
    return { ...preflight, preflightId }
  },
})

export const provisionMainnetTree = internalAction({
  args: {
    preflightId: v.id("trophyTreePreflights"),
    approval: v.literal(MAINNET_TREE_CREATION_APPROVAL),
  },
  handler: async (ctx, args): Promise<ProvisionedMainnetTree> => {
    const quotedPreflight = await ctx.runQuery(
      internal.trophies.getMainnetTreePreflight,
      { preflightId: args.preflightId }
    )
    if (!quotedPreflight || quotedPreflight.consumedAt) {
      throw new Error(
        "Run a new Mainnet Digital Trophy preflight before approving tree creation."
      )
    }
    const currentPreflight = await mainnetTreePreflight()
    if (
      currentPreflight.accountSizeBytes !== quotedPreflight.accountSizeBytes ||
      currentPreflight.rentExemptLamports !== quotedPreflight.rentExemptLamports
    ) {
      throw new Error(
        "The Mainnet rent quote changed; run and explicitly approve a new preflight."
      )
    }
    const reservedPreflight: Doc<"trophyTreePreflights"> =
      await ctx.runMutation(internal.trophies.reserveMainnetTreePreflight, {
        preflightId: args.preflightId,
      })
    const preflight: MainnetTreePreflight = {
      ...MAINNET_TROPHY_TREE_CONFIG,
      accountSizeBytes: reservedPreflight.accountSizeBytes,
      rentExemptLamports: reservedPreflight.rentExemptLamports,
    }
    console.log("Approved Mainnet Digital Trophy tree creation", preflight)
    const umi = mainnetAuthority()

    const metadataStorageId = await ctx.storage.store(
      new Blob([collectionMetadata()], { type: "application/json" })
    )
    const metadataUrl = await ctx.storage.getUrl(metadataStorageId)
    if (!metadataUrl)
      throw new Error(
        "Digital Trophy collection metadata could not be published."
      )

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
        maxDepth: MAINNET_TROPHY_TREE_CONFIG.maxDepth,
        maxBufferSize: MAINNET_TROPHY_TREE_CONFIG.maxBufferSize,
        canopyDepth: MAINNET_TROPHY_TREE_CONFIG.canopyDepth,
        merkleTreeSize: preflight.accountSizeBytes,
        public: MAINNET_TROPHY_TREE_CONFIG.public,
      })
    ).sendAndConfirm(umi)

    const collectionTransactionSignature = Buffer.from(
      collectionTx.signature
    ).toString("base64")
    const treeTransactionSignature = Buffer.from(treeTx.signature).toString(
      "base64"
    )
    await ctx.runMutation(internal.trophies.registerMainnetTree, {
      treeAddress: merkleTree.publicKey,
      collectionAddress: collection.publicKey,
      capacity: MAINNET_TROPHY_TREE_CONFIG.capacity,
      treeRentLamports: preflight.rentExemptLamports,
      collectionTransactionSignature,
      treeTransactionSignature,
    })
    return {
      ...preflight,
      treeAddress: merkleTree.publicKey,
      collectionAddress: collection.publicKey,
      collectionTransactionSignature,
      treeTransactionSignature,
    }
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
  const umi = mainnetAuthority()
  await assertMainnetRpc(umi)
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

      const umi = mainnetAuthority()
      await assertMainnetRpc(umi)
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
