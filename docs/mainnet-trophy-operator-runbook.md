# Mainnet Digital Trophy tree operator runbook

This runbook provisions the first non-public Bubblegum V2 Digital Trophy tree.
It is deliberately a two-command process: the first command is read-only and
does not sign or submit a transaction; the second can submit Mainnet
transactions only after an explicit approval value and operator secret are
provided.

Do not reuse a Devnet address, keypair, rent observation, collection, or tree
address. Do not enter a seed phrase anywhere in this workflow.

## One-time deployment configuration

In the target Convex production deployment, set all of these server-side
variables:

- `MATCHFLASH_TROPHY_NETWORK=mainnet`
- `MATCHFLASH_TROPHY_RPC_URL` to the selected DAS-capable Mainnet RPC URL.
- `MATCHFLASH_TROPHY_AUTHORITY_SECRET_KEY` to the dedicated Mainnet
  mint-authority wallet, either as a 64-byte JSON keypair or Phantom's base58
  private-key export.

Publish the function changes with the normal production deployment command;
`convex codegen` only regenerates bindings and does not publish functions.

## Preflight — no Mainnet transaction

Run this command against production:

```powershell
pnpm.cmd exec convex run trophy_mint:preflightMainnetTree '{}' --prod
```

It verifies that the configured RPC reports the Solana Mainnet genesis hash,
calculates Bubblegum's account size for exactly this configuration, and asks
that RPC for the current rent-exempt lamports:

- `capacity: 32`
- `maxDepth: 5`
- `maxBufferSize: 8`
- `canopyDepth: 5`
- `public: false`

Record the returned `preflightId`, `accountSizeBytes`, and
`rentExemptLamports`. The lamport amount is the live quote for this run only;
it is not a budget estimate and must not be copied from Devnet. Stop if the
output is not the exact configuration above or the quote is not explicitly
approved by the operator. A quote expires after five minutes.

## Explicit approval and creation

Only after recording and approving the preflight output, invoke the separate
creation action. This is an internal Convex function: the authenticated Convex
CLI session is the operator authorization boundary. Do not substitute a public
API function or expose this command in the app:

```powershell
pnpm.cmd exec convex run internal.trophy_mint.provisionMainnetTree '{"preflightId":"<returned preflightId>","approval":"CREATE_MAINNET_TROPHY_TREE"}' --prod
```

The internal action rejects a missing or incorrect approval value, an expired
or consumed quote, a changed rent quote, or a second active tree. It verifies
the live Mainnet quote again immediately before submission, then creates the
Core collection and the non-public 32-leaf tree. Record the returned collection
address, tree address, transaction signatures, account size, and rent-exempt
lamports in the operator log.

Do not run the creation command merely to inspect its output. It can spend
Mainnet SOL from the dedicated authority wallet.

## Capacity and another run

When the active tree is full, the app tells participants only that the current
run is fully claimed. It does not promise another run. A later 32-leaf tree is
a new, explicit operator decision based on observed demand and is outside this
initial-tree command; do not deactivate or replace the active tree ad hoc.
