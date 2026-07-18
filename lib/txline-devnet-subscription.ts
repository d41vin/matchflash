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
  if (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as { token?: unknown }).token === "string" &&
    (payload as { token: string }).token.length > 0
  ) {
    return (payload as { token: string }).token
  }
  throw new Error("TxLINE activation returned no API token.")
}

export function createDevnetSubscribeInstruction(user: PublicKey) {
  const [pricingMatrix] = PublicKey.findProgramAddressSync(
    [Buffer.from("pricing_matrix")],
    TXLINE_DEVNET.programId
  )
  const [tokenTreasury] = PublicKey.findProgramAddressSync(
    [Buffer.from("token_treasury_v2")],
    TXLINE_DEVNET.programId
  )
  const userTokenAccount = getAssociatedTokenAddressSync(
    TXLINE_DEVNET.tokenMint,
    user,
    false,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  const tokenTreasuryVault = getAssociatedTokenAddressSync(
    TXLINE_DEVNET.tokenMint,
    tokenTreasury,
    true,
    TOKEN_2022_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )
  const data = Buffer.alloc(SUBSCRIBE_DISCRIMINATOR.length + 3)
  SUBSCRIBE_DISCRIMINATOR.copy(data)
  data.writeUInt16LE(
    TXLINE_DEVNET.serviceLevelId,
    SUBSCRIBE_DISCRIMINATOR.length
  )
  data.writeUInt8(
    TXLINE_DEVNET.subscriptionWeeks,
    SUBSCRIBE_DISCRIMINATOR.length + 2
  )

  return {
    instruction: new TransactionInstruction({
      programId: TXLINE_DEVNET.programId,
      keys: [
        { pubkey: user, isSigner: true, isWritable: true },
        { pubkey: pricingMatrix, isSigner: false, isWritable: false },
        { pubkey: TXLINE_DEVNET.tokenMint, isSigner: false, isWritable: false },
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

export async function buildDevnetSubscriptionTransaction(
  connection: DevnetSubscriptionConnection,
  user: PublicKey
) {
  const { instruction, userTokenAccount } =
    createDevnetSubscribeInstruction(user)
  const transaction = new Transaction()
  const needsUserTokenAccount =
    (await connection.getAccountInfo(userTokenAccount)) === null

  if (needsUserTokenAccount) {
    transaction.add(
      createAssociatedTokenAccountInstruction(
        user,
        userTokenAccount,
        user,
        TXLINE_DEVNET.tokenMint,
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
