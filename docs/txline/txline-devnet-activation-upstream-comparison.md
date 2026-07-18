# TxLINE Devnet activation: upstream comparison

**Checked:** 2026-07-18 against TxLINE's `main` commit [`b6981f3`](https://github.com/txodds/tx-on-chain/tree/b6981f31e6f230cc1ef1729c34182414a1419682). This note compares the confirmed Devnet transaction `Z2vU5B...pxqEfF` and MatchFlash's local Devnet onboarding helper with TxLINE's current runnable source. It does not expose or require a secret.

## What matches exactly

The local implementation and the upstream free-tier example agree on all documented activation inputs:

| Item | Upstream | MatchFlash local flow | Result |
| --- | --- | --- | --- |
| Devnet host | `https://txline-dev.txodds.com` | Same | Match |
| Guest endpoint | `/auth/guest/start` | Same | Match |
| Activation endpoint | `/api/token/activate` | Same | Match |
| Request body | `txSig`, base64 `walletSignature`, `leagues` | Same | Match |
| Authorization | `Bearer <guest JWT>` | Same | Match |
| Free bundle | `serviceLevelId = 1`, `weeks = 4`, `leagues = []` | Same | Match |
| Signed bytes | UTF-8 `${txSig}:${leagues.join(",")}:${jwt}`; therefore `${txSig}::${jwt}` | Same | Match |

The upstream code constructs that activation preimage, signs it with Ed25519, base64-encodes the detached signature, and sends the three body fields with the Bearer JWT. See [`users.ts`](https://github.com/txodds/tx-on-chain/blob/b6981f31e6f230cc1ef1729c34182414a1419682/examples/devnet/common/users.ts#L219-L352) and the free-tier entrypoint's `1`, `4`, and empty-leagues arguments in [`subscription_free_tier.ts`](https://github.com/txodds/tx-on-chain/blob/b6981f31e6f230cc1ef1729c34182414a1419682/examples/devnet/scripts/subscription_free_tier.ts#L36-L47).

This is also consistent with TxLINE's current [World Cup guide](https://github.com/txodds/tx-on-chain/blob/b6981f31e6f230cc1ef1729c34182414a1419682/documentation/worldcup.mdx#L177-L247) and [troubleshooting checklist](https://github.com/txodds/tx-on-chain/blob/b6981f31e6f230cc1ef1729c34182414a1419682/documentation/examples/troubleshooting.mdx#L11-L53).

The local diagnostic verified the submitted Phantom signature against the confirmed transaction's signing wallet. Therefore, a wrong network, a wrong wallet, wrong activation preimage, and non-base64 signature are not supported by the evidence.

## Material protocol differences

### 1. The runnable source obtains the JWT before the subscription

The upstream `setupUser` function first requests `/auth/guest/start`, retains that JWT, then creates the on-chain subscription and activates it with the **same** JWT. [`users.ts`](https://github.com/txodds/tx-on-chain/blob/b6981f31e6f230cc1ef1729c34182414a1419682/examples/devnet/common/users.ts#L219-L352)

Before the correction made in this investigation, the MatchFlash helper created and confirmed the subscription, then requested a new guest JWT immediately before activation. The hosted guide shows that latter ordering, so TxLINE's source and its guide disagree. This ordering difference is the strongest remaining explanation for a 403: the activation service may associate, cache, or authorize the guest session before it observes the subscription, even though that requirement is undocumented.

**Applied test/fix:** MatchFlash now requests and retains the guest JWT before asking Phantom to subscribe, and uses that identical JWT for the activation message and `Authorization` header. Test it with a new subscription transaction because the original transaction was paired with a different, later JWT.

### 2. The runnable source creates the Token-2022 account separately

If absent, upstream submits and confirms an associated-token-account transaction, waits three seconds, then verifies the account before submitting a second transaction containing only `subscribe`. [`users.ts`](https://github.com/txodds/tx-on-chain/blob/b6981f31e6f230cc1ef1729c34182414a1419682/examples/devnet/common/users.ts#L258-L336)

The submitted transaction combined the Token-2022 associated-account creation and `subscribe` into one transaction. The public Devnet RPC confirms the `Subscribe` instruction succeeded (`Service Row: 1`, `Duration: 4 weeks`) but it was preceded by the associated-token-account instruction. TxLINE's published docs do not say this combination is invalid, and the on-chain program accepted it, so this is a plausible compatibility difference—not a proven 403 cause.

The next retry will have an existing token account, so its transaction will be a standalone `subscribe` transaction, matching this upstream condition as well.

## What is not the cause

- The V3 community material concerns score-proof validation (`validateStatV3` and `/api/scores/stat-validation-v3`), not free-tier subscription activation. The current Devnet V3 script still delegates onboarding to the same `users.setupUser(..., 1, 4, [])` helper. [V3 script](https://github.com/txodds/tx-on-chain/blob/b6981f31e6f230cc1ef1729c34182414a1419682/examples/devnet/scripts/subscription_scores_v3c.ts)
- Service level, program, mint, and instruction encoding were accepted on-chain: the confirmed transaction logs show the current Devnet program's `Subscribe`, row `1`, a four-week duration, and a zero-unit payment. A change to validation V3 cannot alter that result or the token-activation payload.
- Storing a wallet private key in MatchFlash would not fix the 403. The upstream's local-keypair signing and the Phantom signature both produce the required Ed25519 detached signature; the existing signature verifies for the confirmed subscriber wallet.

## Decision

The previous statement that the 403 established a TxLINE service-side failure was too strong. The local flow followed the hosted documentation, but not the current runnable source recommended by TxLINE's support channels. The next technical action is one bounded Devnet retry that mirrors the upstream JWT ordering and creates a standalone subscription transaction; it does not require a private key or real SOL. If that still returns 403, this comparison is strong evidence for TxLINE support.
