# Build Plan

Ordered by risk and dependency, not by time or days — there's no calendar estimate anywhere in this document, deliberately. The ordering principle that matters: resolve what could invalidate later work before building on top of it.

Tags: 🔴 MVP-critical · 🟡 MVP-nice · 🟢 Post-hackathon / deferred

---

## Phase 0 — Unknowns, mostly resolved, a few still open

- ✅ Resolved: there's no single numeric "World Cup" competition ID — fixtures carry a `Fixture Group` string (e.g., "World Cup > Round of 16") that changes as the tournament progresses through stages.
- ✅ Resolved: pricing and network verified directly — see `01-txline-integration-reference.md` §1. Free on both mainnet and devnet, service levels 1 and 12.
- 🔴 Verify empirically, against a live or devnet stream, before shipping: does a scored penalty also fire a separate `goal` action, or is `penalty_outcome.Outcome: "Scored"` the goal-equivalent event on its own?
- 🔴 Verify empirically: the exact `Bookmaker` string for the StablePrice consensus row (see `01` §7 — a strong hypothesis now, not confirmed).
- 🟡 Verify empirically: what `unitId` values actually correspond to tactically, before building anything beyond basic formation grouping on top of it.

## Phase A — Ingestion foundation

- 🔴 Auth flow: guest JWT → on-chain subscribe → token activate → refreshable credentials
- 🔴 Convex schema deployed (`02-data-model.md`)
- 🔴 Ingest worker (persistent process, not a serverless function), gzip + `Last-Event-ID` resume, for both `/api/scores/stream` and `/api/odds/stream`
- 🔴 Raw event storage: every message → `txlineEvents`, unconditionally, before interpretation
- 🔴 The same worker/pipeline must equally support replaying a stored event log at compressed speed — build this alongside live ingestion, not after it. Given where the tournament actually is, replay isn't a fallback to get to eventually.

## Phase B — Normalization and reconciliation

- 🔴 Odds normalizer, canonical StablePrice row selection
- 🔴 State reconciler: `action_amend`/`action_discarded`/`score_adjustment`/`player_stats_adjustment`; reliability flags including the new automatic `periodSuspectSinceAdjustment`
- 🟡 Player lookup table from `lineup`/`lineups`

## Phase C — Event classification, Impact Score, Heat, Flash Cards

- 🔴 Core event types: goal, card, corner, odds swing, phase change
- 🔴 Confirmed/unconfirmed gating, with `Possible` handled as its own distinct signal, not "unconfirmed-goal-lite"
- 🔴 Full Impact Score formula from `03-event-pipeline-and-flash-cards.md` §2, including VAR-by-review-type and the mutually-exclusive match-stakes tiers
- 🔴 Heat, including the new possession-intensity contribution path, wired into the same mutation as confirmed card creation
- 🟡 Penalty two-stage lifecycle
- 🟡 Woodwork-only shot cards
- 🟡 Injury + substitution merging via `FollowsAction`
- 🟡 Comment-sourced cards (severity: warning only), distinct visual treatment
- 🟡 Hat-trick/brace narrative bonus
- 🟢 Anything beyond this event set — extend later, not now

## Phase D — Live and Replay Room UI

- 🔴 Scoreboard, clock, win-probability strip, Flash Card feed — built once, working for both live and replay states from the start
- 🔴 Field visualization, phase 1: pitch, ambient edge-glow, reactions for goal/card/VAR/corner only (`04-field-visualization.md` build order)
- 🔴 `HeatBadge` on the Lobby
- 🔴 Reaction buttons, room-scoped
- 🟡 Field visualization, phase 2: schematic formation, jersey colors, player numbers
- 🟡 Field visualization, phase 3: remaining event reactions, approximate ball, weather indicator, transient broadcast chips
- 🟡 Pre-match atmosphere content
- 🟢 Anything not in `04`'s three build phases

## Phase E — Auth and Rooms

- 🔴 Phantom Connect SDK integration (embedded + injected)
- 🔴 Signature verification → self-signed JWT → Convex `customJwt` provider
- 🔴 Soft-gate: full anonymous browsing of Lobby and Match Room; sign-in only for react/chat/predict/claim
- 🔴 One auto-created `kind: "global"` room per fixture; `/match/[id]` resolves directly to it
- 🔴 Join/Create sheet: public room list + create flow (public or private), one active public + one active private room per user per match
- 🔴 Match leaderboard, room leaderboard
- 🟡 App-wide leaderboard
- 🟡 Chat (Convex-powered, collapsible drawer over the feed), with a basic send-rate limit
- 🟡 Post-match room freeze; "Join or Create Room" relabels to "View Rooms" with no create option
- 🟡 Live-feed staleness banner, driven off `matchStates.updatedAt`
- 🟡 Sign-in nudge via toast at the moment of a gated action (no intent preservation — deliberately kept simple)
- 🟡 Profile/settings surface, including participation history

## Phase F — Predictions

- 🔴 Prompt lifecycle: open → lock → settle, reading only confirmed/active data, pipeline-settled
- 🟢 On-chain predicate settlement — deliberately deferred; see `03` §7. The `settlementMethod` field is the only thing built now.

## Phase G — cNFT and Recap

- 🔴 Recap Receipt: two-tier visibility, no separate gate
- 🔴 Devnet-first: full flow validated (wallet, metadata, soulbound, minting) before mainnet
- 🔴 `merkleTrees` table, operational tree provisioning, exact-cost verification via the SDK before creating anything on mainnet
- 🔴 Explicit claim button, never automatic; always free to the user
- 🔴 `trophyClaims` anti-double-claim guard
- 🔴 Conservative metadata (independently-public facts only — see `05` for exactly what's excluded and why)
- 🟡 Sharing: Share Recap (anyone) and Share Trophy (participants, post-claim only), Web Share API with copy-link/download fallback
- 🟡 Data-quality note in recap if reliability was ever flagged

## Phase H — Legal and compliance

- 🔴 `terms-and-privacy.md` content live as `/terms`, footer summary linking to it
- 🔴 Anonymous access to the full core experience — both a UX principle and close to a hackathon compliance requirement given judges shouldn't need a wallet to evaluate the submission

## Phase I — Polish and submission

- 🔴 `/docs`: real TxLINE endpoints and message IDs actually used, key dependencies/SDKs listed (satisfies the hackathon's attribution requirement for pre-existing components)
- 🔴 Demo video: the room reacting to real TxLINE data (live or replay), explicitly calling out that data is real, not mocked — and that the core experience is fully explorable without an account, given the judge-wallet-access consideration
- 🟡 Technical Feedback section: the odds-shape discovery, the service-level distinction, and the on-chain-settlement idea (genuine, specific, well-reasoned — exactly what this section rewards, whether or not it shipped as code)

---

## Explicitly cut, and why

- **On-chain predicate settlement.** Real cost, real added latency against an already-tight prediction window, real new failure modes in a trust-critical system, low judge-visible benefit relative to documenting it well. See `03` §7 for the full evaluation.
- **Room admin features** (kick, invite regeneration, host transfer). Safe to skip because rooms are already time-bounded by the match itself — not safe to skip forever if rooms become persistent.
- **Chat moderation tooling beyond a basic rate limit.** Post-hackathon; the default Match Room has no chat at all, which limits where this even applies today.
- **A polished internal operations dashboard.** Convex's own table view covers tree monitoring for free.
- **Individual Flash Cards for ordinary shots or standalone possession events.** Ambient signal only — carding every shot floods the feed within minutes.
- **The more theatrical end of field-visualization overlays** (confetti, shimmer, scan-lines, randomized hype text). Reviewed and deliberately left behind — see `04-field-visualization.md`'s "what was looked at and not adopted."
- **Building every field-visualization idea simultaneously.** Sequenced instead — see `04`'s build order.
- **Multisport infrastructure beyond the cheap signaling already in place** (the `sport` field, disabled Lobby tabs). Real pipeline work for a second sport is substantial and shouldn't start before soccer is solid.
