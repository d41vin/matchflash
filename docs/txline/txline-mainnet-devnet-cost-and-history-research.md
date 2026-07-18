# TxLINE Mainnet/Devnet cost and historical-data findings

Researched 2026-07-18 from TxLINE documentation and its linked official
example repository. This records an operator decision input; it does not
change the existing Mainnet-level-12 implementation decision.

## Answer

- **Mainnet free is not zero-cost.** Level 12 is free in TxL, but `subscribe`
  spends real Mainnet SOL for the network fee and may require account rent.
  TxLINE publishes no fixed lamport total.
- **Devnet needs Devnet SOL, not purchased Mainnet SOL.** TxLINE tells Devnet
  users to request Devnet SOL. Solana documents Devnet tokens as not real;
  faucet availability may still be limited.
- **Do not promise a replay of every completed World Cup match.** The landing
  page says historical access is included, but the documented full-score
  endpoint only supports fixtures started six hours to two weeks ago. Odds
  history endpoints publish no retention period.

## Cost evidence and a no-spend preflight

The [World Cup Free Tier guide](https://txline.txodds.com/documentation/worldcup)
says free means “no TxL subscription payment,” while SOL on the selected
network still pays transaction fees and any account rent required by
`subscribe`. It separately says the free transaction consumes SOL for normal
fees. The current [Subscription Tiers](https://txline.txodds.com/documentation/subscription-tiers)
lists Mainnet level 12 (real-time World Cup and International Friendlies) and
Devnet level 1 as Free. That is a TxL-price statement, not a zero-SOL-cost
statement.

| Network | Free service | SOL used by subscribe | Operator consequence |
| --- | --- | --- | --- |
| Mainnet | Level 12, real-time | Real Mainnet SOL | Fee is a real spend; possible rent must be preflighted. |
| Devnet | Level 1, current matrix says `samplingIntervalSec = 0` | Devnet test SOL | No Mainnet-SOL purchase; use only to exercise the integration. |

TxLINE does not offer a quote for the free subscription or state the possible
account sizes/rent. Before a Phantom signature, construct the *exact* current
Mainnet level-12, 4-week transaction with the selected payer, live IDL/program,
and derived Token-2022 accounts. Then:

1. Read the `pricing_matrix` as TxLINE documents and confirm level 12's
   `pricePerWeekToken` is zero.
2. Ask the Mainnet RPC for the serialized transaction message's fee and
   simulate it without broadcasting. Inspect simulation logs/account creation.
3. For every account that will be created, obtain its rent-exempt lamports;
   display fee plus those rents (and a small safety buffer) before signing.

Inputs that change the figure are the current fee market, the payer's existing
Token-2022 account state, and the live program/IDL/matrix. TxLINE's docs are
silent on whether any rent can later be reclaimed, so do not assume it is.

The [Devnet examples](https://txline.txodds.com/documentation/examples/devnet-examples)
require a funded Devnet wallet and `https://api.devnet.solana.com`; the free-tier
guide explicitly tells users to request Devnet SOL before starting.
[Solana's cluster documentation](https://solana.com/docs/references/clusters#devnet)
confirms that Devnet tokens are not real.

## Historical World Cup coverage: what the docs actually promise

| Need | Published capability/limit | Safe conclusion |
| --- | --- | --- |
| Find fixtures | [Fixture snapshot](https://txline.txodds.com/api-reference/fixtures/get-the-latest-snapshot-of-fixtures-optionally-starting-at-or-within-30-days-after-a-given-epoch-day) starts at/within 30 days after an epoch day; no archive-retention guarantee. | Do not assume the whole completed tournament can be listed. |
| Full score sequence for one fixture | [Score history](https://txline.txodds.com/api-reference/scores/get-the-full-sequence-of-score-updates-for-a-single-fixture) returns all updates only where the fixture started between six hours and two weeks ago. | Only that rolling window is explicitly supported. Capture wanted recent matches now. |
| Older score/odds updates | [Scores](https://txline.txodds.com/api-reference/scores/get-a-json-array-of-all-score-updates-from-a-specific-historical-5-minute-interval-no-live-data-is-returned) and [odds](https://txline.txodds.com/api-reference/odds/get-a-json-array-of-all-odd-updates-from-a-specific-historical-5-minute-interval) 5-minute endpoints exist, but neither states retention. | Older availability is unconfirmed. |
| Historical odds snapshot | [Odds snapshot](https://txline.txodds.com/api-reference/odds/get-snapshots-of-the-latest-odds-for-a-fixture) accepts `asOf`, but states no retention. | Older availability is unconfirmed. |

The [World Cup page](https://txline.txodds.com/documentation/worldcup) broadly
claims “full access to historical data,” which is not reconciled with the
endpoint-specific score window. Test each wanted fixture immediately and ask
TxLINE for written retention/coverage confirmation before claiming complete
tournament replay coverage.

## Network differences

TxLINE requires the RPC, program ID, JWT, activation endpoint, and API host to
match; a Devnet subscription cannot activate on the Mainnet host. Mainnet offers
level 1 (60-second delay) and level 12 (real-time); Devnet exposes level 1 only
and TxLINE says to verify its live on-chain matrix before relying on the current
zero-second sampling row. Source: [network setup and free-tier selection](https://txline.txodds.com/documentation/worldcup#step-1-choose-a-network-and-set-up-your-wallet).

The docs expose both hosts but do not guarantee fixture or historical-data
parity. Devnet is therefore a no-money-at-risk integration proof, not a
documented substitute for the remaining real matches or production replay
coverage. For the documented real-time live source, only Mainnet level 12 fits.
