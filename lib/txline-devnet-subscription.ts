import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type AccountInfo,
  type Commitment,
} from "@solana/web3.js"
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_2022_PROGRAM_ID,
} from "@solana/spl-token"

export const TXLINE_DEVNET = {
  apiOrigin: "https://txline-dev.txodds.com",
  programId: new PublicKey("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"),
  rpcUrl: "https://api.devnet.solana.com",
  serviceLevelId: 1,
  subscriptionWeeks: 4,
  tokenMint: new PublicKey("4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG"),
} as const

export const TXLINE_MAINNET = {
  apiOrigin: "https://txline.txodds.com",
  programId: new PublicKey("9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA"),
  rpcUrl: "https://api.mainnet-beta.solana.com",
  serviceLevelId: 12,
  subscriptionWeeks: 4,
  tokenMint: new PublicKey("Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL"),
} as const

type TxlineSubscriptionConfig = typeof TXLINE_DEVNET | typeof TXLINE_MAINNET

const SUBSCRIBE_DISCRIMINATOR = Buffer.from([
  254, 28, 191, 138, 156, 179, 183, 53,
])

type LatestBlockhash = {
  blockhash: string
  lastValidBlockHeight: number
}

export type DevnetSubscriptionConnection = {
  getAccountInfo(address: PublicKey): Promise<AccountInfo<Buffer> | null>
  getLatestBlockhash(commitment?: Commitment): Promise<LatestBlockhash>
  simulateTransaction(transaction: Transaction): Promise<{
    value: { err: unknown; logs: string[] | null }
  }>
}

export function activationMessage(
  transactionSignature: string,
  guestJwt: string
) {
  return `${transactionSignature}::${guestJwt}`
}

export function apiTokenFromActivationResponse(payload: unknown) {
  if (typeof payload === "string" && payload.length > 0) {
    return payload
  }

  if (typeof payload === "object" && payload !== null) {
    const response = payload as Record<string, unknown>
    for (const field of ["token", "apiToken", "api_token"] as const) {
      if (typeof response[field] === "string" && response[field].length > 0) {
        return response[field]
      }
    }
    if (typeof response.data === "string" && response.data.length > 0) {
      return response.data
    }
    if (typeof response.data === "object" && response.data !== null) {
      return apiTokenFromActivationResponse(response.data)
    }
  }

  throw new Error("TxLINE activation returned no API token.")
}

function createTxlineSubscribeInstruction(
  config: TxlineSubscriptionConfig,
  user: PublicKey
) {
  const [pricingMatrix] = PublicKey.findProgramAddressSync(
    [Buffer.from("pricing_matrix")],
    config.programId
  )
  const [tokenTreasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    config.programId
  )
  const userTokenAccount = getAssociatedTokenAddressSync(
    config.tokenMint,
    user,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    config.tokenMint,
    tokenTreasury,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  const data = Buffer.alloc(SUBSCRIBE_DISCRIMINATOR.length + 3)
  SUBSCRIBE_DISCRIMINATOR.copy(data)
  data.writeUInt16LE(
    config.serviceLevelId,
    SUBSCRIBE_DISCRIMINATOR.length
  )
  data.writeUInt8(
    config.subscriptionWeeks,
    SUBSCRIBE_DISCRIMINATOR.length + 2
  )

  return {
    instruction: new TransactionInstruction({
      programId: config.programId,
      keys: [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: pricingMatrix, isSigner: false, isWritable: false },
        { pubkey: config.tokenMint, isSigner: false, isWritable: false },
        { pubkey: userTokenAccount, isSigner: false, isWritable: true },
        { pubkey: tokenTreasuryVault, isSigner: false, isWritable: true },
        { pubkey: tokenTreasury, isSigner: false, isWritable: false },
        { pubkey: TOKEN_2022_PROGRAM_ID, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        {
          pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
          isSigner: false,
          isWritable: false,
        },
      ],
      data,
    }),
    userTokenAccount,
  }
}

export function createDevnetSubscribeInstruction(user: PublicKey) {
  return createTxlineSubscribeInstruction(TXLINE_DEVNET, user)
}

export function createMainnetSubscribeInstruction(user: PublicKey) {
  return createTxlineSubscribeInstruction(TXLINE_MAINNET, user)
}

export async function buildDevnetSubscriptionTransaction(
  connection: DevnetSubscriptionConnection,
  user: PublicKey
) {
  return buildTxlineSubscriptionTransaction(TXLINE_DEVNET, connection, user)
}

export async function buildMainnetSubscriptionTransaction(
  connection: DevnetSubscriptionConnection,
  user: PublicKey
) {
  return buildTxlineSubscriptionTransaction(TXLINE_MAINNET, connection, user)
}

async function buildTxlineSubscriptionTransaction(
  config: TxlineSubscriptionConfig,
  connection: DevnetSubscriptionConnection,
  user: PublicKey
) {
  const { instruction, userTokenAccount } = createTxlineSubscribeInstruction(
    config,
    user
  )
  const transaction = new Transaction()
  const needsUserTokenAccount =
    (await connection.getAccountInfo(userTokenAccount)) === null

  if (needsUserTokenAccount) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        user,
        userTokenAccount,
        user,
        config.tokenMint,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )
  }

  const latestBlockhash = await connection.getLatestBlockhash("confirmed")
  transaction.add(instruction)
  transaction.feePayer = user
  transaction.recentBlockhash = latestBlockhash.blockhash

  return { latestBlockhash, needsUserTokenAccount, transaction }
}

export async function preflightDevnetSubscription(
  connection: DevnetSubscriptionConnection,
  transaction: Transaction
) {
  const simulation = await connection.simulateTransaction(transaction)
  if (simulation.value.err) {
    const logs = simulation.value.logs?.join(" ")
    throw new Error(
      `TxLINE Devnet subscription preflight failed: ${JSON.stringify(simulation.value.err)}${
        logs ? ` (${logs})` : ""
      }`
    )
  }
}
