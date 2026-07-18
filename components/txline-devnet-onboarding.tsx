"use client"

import { useConnect, usePhantom, useSolana } from "@phantom/react-sdk"
import { Connection, PublicKey } from "@solana/web3.js"
import { useState } from "react"

import {
  activationMessage,
  apiTokenFromActivationResponse,
  buildDevnetSubscriptionTransaction,
  buildMainnetSubscriptionTransaction,
  buildMainnetTokenAccountTransaction,
  preflightDevnetSubscription,
  TXLINE_DEVNET,
  TXLINE_MAINNET,
} from "@/lib/txline-devnet-subscription"

type OnboardingState =
  "ready" | "subscribing" | "subscribed" | "activating" | "activated" | "error"

function base64(bytes: Uint8Array) {
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return window.btoa(binary)
}

async function readJson<T>(response: Response) {
  const payload = (await response.json()) as T & { error?: string }
  if (!response.ok)
    throw new Error(payload.error ?? "TxLINE Devnet request failed.")
  return payload
}

function TxlineOnboarding({ network }: { network: "devnet" | "mainnet" }) {
  const { connect, isConnecting } = useConnect()
  const { isConnected } = usePhantom()
  const { solana, isAvailable } = useSolana()
  const [state, setState] = useState<OnboardingState>("ready")
  const [error, setError] = useState<string | null>(null)
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null)
  const [subscriberAddress, setSubscriberAddress] = useState<string | null>(
    null
  )
  const [createdTokenAccount, setCreatedTokenAccount] = useState(false)
  const [apiToken, setApiToken] = useState<string | null>(null)
  const [activationJwt, setActivationJwt] = useState<string | null>(null)
  const isMainnet = network === "mainnet"
  const txline = isMainnet ? TXLINE_MAINNET : TXLINE_DEVNET
  const networkName = isMainnet ? "Mainnet" : "Devnet"
  const tokenEnvFile = isMainnet ? ".env.worker" : ".env.txline-devnet"

  async function connectWallet() {
    setError(null)
    try {
      if (!isConnected) await connect({ provider: "injected" })
      await solana.switchNetwork(network)
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : `Could not connect Phantom to ${networkName}.`
      )
    }
  }

  async function subscribe() {
    if (!isAvailable || !solana.publicKey) {
      setError("Connect your Phantom Solana wallet before subscribing.")
      return
    }
    setError(null)
    setState("subscribing")
    setActivationJwt(null)
    setTransactionSignature(null)
    setSubscriberAddress(null)
    try {
      await solana.switchNetwork(network)
      const guest = await readJson<{ token: string }>(
        await fetch(`/api/txline/${network}/guest`, { method: "POST" })
      )
      const connection = new Connection(txline.rpcUrl, "confirmed")
      if (isMainnet) {
        const account = await buildMainnetTokenAccountTransaction(
          connection,
          new PublicKey(solana.publicKey)
        )
        if (account) {
          await preflightDevnetSubscription(connection, account.transaction)
          const sentAccount = await solana.signAndSendTransaction(
            account.transaction
          )
          await connection.confirmTransaction(
            {
              signature: sentAccount.signature,
              blockhash: account.latestBlockhash.blockhash,
              lastValidBlockHeight: account.latestBlockhash.lastValidBlockHeight,
            },
            "confirmed"
          )
          setCreatedTokenAccount(true)
          await new Promise((resolve) => setTimeout(resolve, 3000))
        }
      }
      const built = await (isMainnet
        ? buildMainnetSubscriptionTransaction(
            connection,
            new PublicKey(solana.publicKey)
          )
        : buildDevnetSubscriptionTransaction(
            connection,
            new PublicKey(solana.publicKey)
          ))
      setCreatedTokenAccount(built.needsUserTokenAccount)
      await preflightDevnetSubscription(connection, built.transaction)
      const sent = await solana.signAndSendTransaction(built.transaction)
      await connection.confirmTransaction(
        {
          signature: sent.signature,
          blockhash: built.latestBlockhash.blockhash,
          lastValidBlockHeight: built.latestBlockhash.lastValidBlockHeight,
        },
        "confirmed"
      )
      setTransactionSignature(sent.signature)
      setSubscriberAddress(solana.publicKey)
      setActivationJwt(guest.token)
      setState("subscribed")
    } catch (cause) {
      setActivationJwt(null)
      setState("error")
      setError(
        cause instanceof Error
          ? cause.message
          : `${networkName} subscription was not completed.`
      )
    }
  }

  async function activate() {
    if (
      !transactionSignature ||
      !subscriberAddress ||
      !solana.publicKey ||
      !activationJwt
    ) {
      setError(
        `Create a new ${networkName} subscription before activating it so TxLINE can associate the guest session with the transaction.`
      )
      return
    }
    if (solana.publicKey !== subscriberAddress) {
      setError(
        "Reconnect the same Phantom Solana wallet that submitted the Devnet subscription."
      )
      return
    }
    setError(null)
    setState("activating")
    try {
      await solana.switchNetwork(network)
      const signed = await solana.signMessage(
        new TextEncoder().encode(
          activationMessage(transactionSignature, activationJwt)
        )
      )
      if (signed.publicKey !== subscriberAddress) {
        throw new Error(
          "The activation message must be signed by the subscribing Phantom wallet."
        )
      }
      const activated = await readJson<unknown>(
        await fetch(`/api/txline/${network}/activate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jwt: activationJwt,
            txSig: transactionSignature,
            walletSignature: base64(signed.signature),
          }),
        })
      )
      setApiToken(apiTokenFromActivationResponse(activated))
      setState("activated")
    } catch (cause) {
      setState("error")
      setError(
        cause instanceof Error
          ? cause.message
          : `${networkName} activation was not completed.`
      )
    }
  }

  async function copyApiToken() {
    if (apiToken) await navigator.clipboard.writeText(apiToken)
  }

  const busy = state === "subscribing" || state === "activating"
  const walletAddress = solana.publicKey

  return (
    <main className="min-h-svh bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-2xl space-y-8">
        <header>
          <p className="text-sm font-semibold tracking-[0.18em] text-cyan-200">
            MATCHFLASH OPERATOR TOOL
          </p>
          <h1 className="mt-3 text-3xl font-black tracking-tight">
            TxLINE {networkName} onboarding
          </h1>
          <p className="mt-3 text-slate-300">
            This creates a free level-{txline.serviceLevelId}, four-week TxLINE
            subscription on Solana {networkName}, then asks Phantom to sign the
            API-token activation message.
          </p>
        </header>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="font-bold">1. Connect Phantom and switch to {networkName}</h2>
          <p className="mt-2 text-sm text-slate-300">
            Use the funded Solana {networkName} wallet. Never enter a private
            key here.
          </p>
          <button
            className="mt-4 rounded-md bg-cyan-300 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
            disabled={isConnecting || busy}
            onClick={() => void connectWallet()}
          >
            {isConnecting
              ? "Connecting…"
              : isConnected
                ? `Switch Phantom to ${networkName}`
                : "Connect Phantom"}
          </button>
          {walletAddress ? (
            <p className="mt-3 text-sm break-all text-cyan-100">
              Connected Solana address: {walletAddress}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="font-bold">2. Approve the free {networkName} subscription</h2>
          <p className="mt-2 text-sm text-slate-300">
            Phantom will show a {networkName} transaction for TxLINE service
            level {txline.serviceLevelId} and a four-week term. It may also
            create your empty Token-2022 account; that is normal and consumes
            only {networkName} SOL.
          </p>
          <button
            className="mt-4 rounded-md bg-cyan-300 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
            disabled={
              !walletAddress ||
              busy ||
              state === "subscribed" ||
              state === "activated"
            }
            onClick={() => void subscribe()}
          >
            {state === "subscribing"
              ? "Waiting for Phantom…"
              : `Create ${networkName} subscription`}
          </button>
          {createdTokenAccount ? (
            <p className="mt-3 text-sm text-slate-300">
              A Token-2022 account was included because this wallet did not have
              one.
            </p>
          ) : null}
          {transactionSignature ? (
            <p className="mt-3 text-sm break-all text-cyan-100">
              Confirmed transaction: {transactionSignature}
            </p>
          ) : null}
          {subscriberAddress ? (
            <p className="mt-3 text-sm break-all text-cyan-100">
              Subscribing wallet: {subscriberAddress}
            </p>
          ) : null}
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900 p-5">
          <h2 className="font-bold">
            3. Sign the activation message and save the token
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            This second Phantom prompt signs a message; it is not another
            transaction. The resulting API token stays in this browser until you
            copy it.
          </p>
          <button
            className="mt-4 rounded-md bg-cyan-300 px-4 py-2 font-bold text-slate-950 disabled:opacity-50"
            disabled={!transactionSignature || busy || state === "activated"}
            onClick={() => void activate()}
          >
            {state === "activating"
              ? "Waiting for Phantom…"
              : "Sign and activate"}
          </button>
          {apiToken ? (
            <div className="mt-4 space-y-3">
              <p className="rounded-md bg-slate-950 p-3 font-mono text-xs break-all text-cyan-100">
                {apiToken}
              </p>
              <button
                className="rounded-md border border-cyan-300 px-4 py-2 text-sm font-bold text-cyan-100"
                onClick={() => void copyApiToken()}
              >
                Copy API token
              </button>
              <p className="text-sm text-slate-300">
                Paste it only into the ignored <code>{tokenEnvFile}</code> file.
                Do not put this token in a browser variable.
              </p>
            </div>
          ) : null}
        </section>

        {error ? (
          <p className="rounded-md border border-red-500 bg-red-950/50 p-4 text-sm text-red-100">
            {error}
          </p>
        ) : null}
      </div>
    </main>
  )
}

export function TxlineDevnetOnboarding() {
  return <TxlineOnboarding network="devnet" />
}

export function TxlineMainnetOnboarding() {
  return <TxlineOnboarding network="mainnet" />
}
