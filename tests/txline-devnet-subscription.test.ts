import assert from "node:assert/strict"
import test from "node:test"

import { Keypair } from "@solana/web3.js"

import {
  activationMessage,
  apiTokenFromActivationResponse,
  buildDevnetSubscriptionTransaction,
  createDevnetSubscribeInstruction,
  preflightDevnetSubscription,
  TXLINE_DEVNET,
  type DevnetSubscriptionConnection,
} from "../lib/txline-devnet-subscription.ts"

test("creates the documented Devnet free-tier subscribe instruction", () => {
  const user = Keypair.generate().publicKey
  const { instruction, userTokenAccount } =
    createDevnetSubscribeInstruction(user)

  assert.equal(
    instruction.programId.toBase58(),
    TXLINE_DEVNET.programId.toBase58()
  )
  assert.equal(instruction.keys.length, 9)
  assert.equal(instruction.keys[0]?.pubkey.toBase58(), user.toBase58())
  assert.equal(instruction.keys[0]?.isSigner, true)
  assert.equal(
    instruction.keys[3]?.pubkey.toBase58(),
    userTokenAccount.toBase58()
  )
  assert.equal(instruction.data.toString("hex"), "fe1cbf8a9cb3b735010004")
})

test("adds the user Token-2022 account only when it is absent", async () => {
  const user = Keypair.generate().publicKey
  const connection = {
    getAccountInfo: async () => null,
    getLatestBlockhash: async () => ({
      blockhash: "7YttLkHdoNj9wyDur5FqFbpZCGGNz9ETe6Mf87o9HawZ",
      lastValidBlockHeight: 42,
    }),
    simulateTransaction: async () => ({ value: { err: null, logs: null } }),
  } as DevnetSubscriptionConnection

  const built = await buildDevnetSubscriptionTransaction(connection, user)

  assert.equal(built.needsUserTokenAccount, true)
  assert.equal(built.transaction.instructions.length, 2)
  assert.equal(
    built.transaction.instructions[1]?.programId.toBase58(),
    TXLINE_DEVNET.programId.toBase58()
  )
  assert.equal(built.transaction.feePayer?.toBase58(), user.toBase58())
})

test("fails before a wallet prompt when Devnet rejects the subscription transaction", async () => {
  const user = Keypair.generate().publicKey
  const connection = {
    getAccountInfo: async () => null,
    getLatestBlockhash: async () => ({
      blockhash: "7YttLkHdoNj9wyDur5FqFbpZCGGNz9ETe6Mf87o9HawZ",
      lastValidBlockHeight: 42,
    }),
    simulateTransaction: async () => ({
      value: {
        err: { InstructionError: [1, "InvalidInstructionData"] },
        logs: ["custom log"],
      },
    }),
  } as DevnetSubscriptionConnection
  const built = await buildDevnetSubscriptionTransaction(connection, user)

  await assert.rejects(
    () => preflightDevnetSubscription(connection, built.transaction),
    /subscription preflight failed/
  )
})

test("formats standard-bundle activation and validates its API token response", () => {
  assert.equal(
    activationMessage("transaction", "guest-jwt"),
    "transaction::guest-jwt"
  )
  assert.equal(
    apiTokenFromActivationResponse({ token: "api-token" }),
    "api-token"
  )
  assert.equal(
    apiTokenFromActivationResponse({ data: { apiToken: "api-token" } }),
    "api-token"
  )
  assert.equal(apiTokenFromActivationResponse("api-token"), "api-token")
  assert.throws(() => apiTokenFromActivationResponse({}), /no API token/)
})
