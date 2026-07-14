# TxLINE Integration Reference

Everything verified directly against TxLINE's live documentation as of this writing — not assumed, not carried over from an earlier pass without checking. Read this before writing the ingest worker.

## 1. Network and pricing — verified

Both networks are genuinely free for World Cup and International Friendlies coverage, and this includes both Scores and Odds — there's no "scores free, odds paid" trap.

| Network | Free service level | Delay                                                                              | Program ID                                     |
| ------- | ------------------ | ---------------------------------------------------------------------------------- | ---------------------------------------------- |
| Mainnet | 1                  | 60 seconds                                                                         | `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` |
| Mainnet | 12                 | Real-time                                                                          | `9ExbZjAapQww1vfcisDmrngPinHTEfpjYRWMunJgcKaA` |
| Devnet  | 1                  | Effectively real-time (0-second sampling, per the current on-chain pricing matrix) | `6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J` |

Every paid tier is for leagues outside World Cup/International Friendlies — irrelevant here. Subscriptions run in mandatory 4-week cycles even on the free tier (an on-chain housekeeping requirement, not a cost); budget for a re-subscribe if the build spans more than 4 weeks. Devnet submissions explicitly qualify for hackathon judging — this isn't a lesser path.

**Pick one network and hold it consistently.** The Solana RPC, program ID, TxL mint, guest JWT host, and API origin must all match:

|            | Mainnet                                       | Devnet                                         |
| ---------- | --------------------------------------------- | ---------------------------------------------- |
| RPC        | `https://api.mainnet-beta.solana.com`         | `https://api.devnet.solana.com`                |
| API origin | `https://txline.txodds.com`                   | `https://txline-dev.txodds.com`                |
| TxL mint   | `Zhw9TVKp68a1QrftncMSd6ELXKDtpVMNuMGr1jNwdeL` | `4Zao8ocPhmMgq7PdsYWyxvqySMGx7xb9cMftPMkEokRG` |

## 2. Licensing — read before building anything permanent

The data license is granted **solely for hackathon participation and terminates automatically when the hackathon concludes.** It explicitly prohibits redistributing, publishing, sublicensing, selling, or otherwise sharing the Data. This is why the cNFT trophy's metadata is scoped to independently-public match facts rather than TxLINE-specific payloads — see `05-cnft-and-recap.md`. Any future version that wants to keep using TxLINE data past the hackathon, or wants to embed more of it into anything permanent, needs a direct conversation with TxODDS first, not an assumption that the free tier just continues.

## 3. Auth flow (for the ingest worker itself — not user login)

Not to be confused with MatchFlash's own user authentication (Phantom Connect + Convex, see below) — this is how the backend gets permission to read TxLINE's feeds at all.

1. `POST {apiOrigin}/auth/guest/start` → a guest JWT (expires in 30 days).
2. Subscribe on-chain: call the `subscribe(serviceLevelId, durationWeeks)` program method with the standard bundle (empty `leagues` array covers World Cup + International Friendlies).
3. Sign the activation message — exactly `${txSig}:${leagues.join(",")}:${jwt}`, base64-encoded detached signature, same wallet that submitted the subscribe transaction.
4. `POST {apiOrigin}/api/token/activate` with that signature → an API token.
5. Every data request needs both: `Authorization: Bearer {jwt}` and `X-Api-Token: {apiToken}`.

If a data request 401s, renew the guest JWT and retry with the same API token. If activation 403s, the usual culprits are a network mismatch, a different signing wallet, or a wrong message string.

**MatchFlash's own user auth is unrelated to any of this** — see `00-project-brief.md` §6 and `02-data-model.md` for the Phantom Connect + Convex custom-JWT flow that authenticates fans.

## 4. Endpoints in use

| Endpoint                                                                   | Purpose                                                               |
| -------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `/api/fixtures/snapshot`                                                   | Latest fixture metadata snapshot                                      |
| `/api/odds/stream` (SSE)                                                   | Real-time odds updates                                                |
| `/api/scores/stream` (SSE)                                                 | Real-time score/event updates                                         |
| `/api/scores/stat-validation`                                              | Predicate-based on-chain proof simulation for a stat (see §6)         |
| Merkle proof endpoints (fixture batch, single fixture, single odds update) | Cryptographic proof retrieval, backing the "verified" claim generally |

Both SSE streams support gzip and `Last-Event-ID` resume. Filter heartbeats before interpreting messages.

## 5. The message catalog

The soccer feed has roughly 46 distinct message types — considerably more than a first pass through the summary docs suggests. Full detail (per-field schemas) lives in the source spec; this is the organized reference for what each category is actually good for.

**Structural notes that affect everything downstream:**

- The clock counts **down** remaining seconds in the current period (`Clock.Seconds` + `Clock.Running`), not up — "minute 73" is derived, never a raw field.
- **No positional/tracking data exists anywhere in this feed.** No ball or player coordinates. This is decisive for the field visualization (§ in `04-field-visualization.md`) and for resisting any temptation to fake precision elsewhere.
- **`Possible` is a standalone, always-final signal, not an unconfirmed version of a later action.** It doesn't share an ID with whatever it's hinting at. Treat it as ambient tension, not a preview of a specific outcome.
- **`CoverageSecondaryData`** on the fixture tells you in advance whether player-level detail (scorer, assist) will be available at all for that match. Anything scorer-dependent needs a graceful team-level fallback.
- **A `Score Adjustment` casts doubt on more than the score** — the spec states outright that other stats for that period may no longer be accurate once one fires. Treat this as an automatic, structural reliability flag for that period's other stats, not just a narrative footnote (Design Principle 6).

| Category                | Message types                                                                                                                                                                                                                          |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Match lifecycle         | `standby`, `kickoff`, `kickoff_team`, `status`, `halftime_finalised`, `clock_adjustment`                                                                                                                                               |
| Scoring & shots         | `goal`, `shot`, `penalty` (attempt), `penalty_outcome`, `penalty_shootout_team`                                                                                                                                                        |
| Discipline              | `yellow_card`, `red_card`, `var`, `var_end`                                                                                                                                                                                            |
| Set pieces & flow       | `corner`, `free_kick`, `throw_in`, `goal_kick`                                                                                                                                                                                         |
| Territory/possession    | `possession`, `safe_possession`, `attack_possession`, `danger_possession`, `high_danger_possession` — each a standalone auto-confirmed event, and also embedded as a field on most other actions                                       |
| Personnel               | `substitution`, `injury`, `lineup`, `lineups`, `players_on_the_pitch` (+ `adjustment`), `players_warming_up`                                                                                                                           |
| Anticipation            | `possible` (goal/corner/penalty/red/yellow/VAR flags, global or team-specific)                                                                                                                                                         |
| Atmosphere              | `weather` (updates mid-match, not just pre-kickoff), `venue` (explicit home/away/neutral), `jersey` (real color enum)                                                                                                                  |
| Narrative               | `comment` (reporter-written, pre-made or free text, with a severity level)                                                                                                                                                             |
| Corrections/reliability | `action_amend`, `action_discarded`, `score_adjustment`, `player_stats_adjustment`, `players_on_the_pitch_adjustment`, `suspend` (with separate `IsAnalyst`/`Locked`/`Reliable` flags), `unreliable_corners`, `unreliable_yellow_cards` |
| Administrative          | `connected`/`disconnected` (TxODDS's own reporter/analyst network state — not your app's connection health)                                                                                                                            |

Notably new relative to the original pass: `shot` (with outcome and player — `Woodwork` specifically is genuinely rare, dramatic signal), `injury` (with an outcome telling you if the player's returning), and `comment`, which carries real broadcast-quality text including things with no dedicated structured action at all — a coach's dismissal, for instance, arrives as comment text, not through the `red_card` action.

**VAR and penalties carry richer detail than a flat weight implies.** VAR's opening message includes a review type (`Goal`, `Penalty`, `RedCard`, `SecondYellowCard`, `CornerKick`, `MistakenIdentity`, `Other`) — a review that could disallow a goal is not the same event as a review of a corner. Penalties are genuinely two-stage (`penalty` awarded, then `penalty_outcome` resolved), the same shape as VAR. One open question worth confirming empirically against a live stream: whether a scored penalty _also_ fires a separate `goal` action, or whether `penalty_outcome.Outcome: "Scored"` is the goal-equivalent event on its own — the spec doesn't make this explicit, and getting it wrong either double- or under-counts a penalty goal.

## 6. On-chain validation — how it actually works

Not a lightweight REST check. It's a real Anchor program simulation (`.view()`, near the maximum compute budget) against a Merkle-proof structure, requiring a `fixtureSummary`, sub-tree and main-tree proofs, and a predicate.

**The predicate only proves threshold/comparison claims, never exact values.** You can prove "Participant 1's goals exceeded Participant 2's" or "the margin was under 2" (optionally by subtracting two stats and comparing the result). You cannot prove "the score was exactly 2–1" as a single claim. This shapes what "verified" can mean for any given feature — see `03-event-pipeline-and-flash-cards.md` §7 for where this was and wasn't used.

`/api/scores/stat-validation` takes `fixtureId`, `seq`, `statKey`, and optionally `statKey2` — matches the existing `stat-keys.ts` helper exactly.

## 7. Odds — StablePrice

The payload shape already assumed (`FixtureId`, `Bookmaker`, `SuperOddsType`, `MarketPeriod`, `Pct`, etc.) is confirmed accurate against the live OpenAPI spec. What's new: the product is branded "StablePrice" — TxODDS's own de-margined _consensus_ pricing engine. The canonical row to filter for in `discoverOddsTaxonomy()` is very likely a `Bookmaker` value referencing this consensus line directly, rather than an arbitrary real bookmaker chosen as a stand-in. Confirm this the first time discovery runs against a live fixture — it's a strong hypothesis now, not a blind guess, but still needs live confirmation.

## 8. Known documentation risk

TxODDS's own docs aren't fully internally consistent. One API description references an `oracle.txodds.com` auth host that doesn't match the actual OpenAPI `servers:` block or any working code sample anywhere else in their documentation. Trust the `servers:` block and the code samples; that mention looks like unscrubbed internal naming.
