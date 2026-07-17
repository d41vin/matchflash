# MatchFlash Core Experience

Status: ready-for-agent

## Problem Statement

Fans and hackathon judges need an anonymous-first way to follow the final World Cup matches and revisit them afterward without pretending the TxLINE feed has positional data it does not provide, exposing TxLINE credentials, requiring a wallet for comprehension, or turning predictions and commemorative cNFTs into wagering incentives. The current repository is only the generated Next.js and Convex starter, so none of the live, replay, room, trust, identity, or archival behavior exists yet.

## Solution

Build MatchFlash as a mobile-first World Cup soccer companion. A single persistent worker ingests TxLINE Mainnet level-12 data, stores raw messages once, projects a shared fixture state and classified timeline in Convex, and feeds anonymous Match Rooms and individual replay sessions. Authenticated fans may react, use deterministic zero-stake predictions, participate in rooms and chat, and claim a free soulbound Digital Trophy after live participation. At the confirmed end of the TxLINE license, the app transitions cleanly to Archive Mode, removing licensed match content while preserving a narrow, metadata-safe trophy claim path.

## User Stories

1. As an anonymous fan, I want to browse the Lobby without signing in, so that I can understand MatchFlash before sharing any identity or wallet information.
2. As an anonymous fan, I want to open a live Match Room directly from a fixture, so that I can follow a match without joining a social room first.
3. As an anonymous fan, I want the Match Room to show a shared scoreboard, match phase, clock, field visualization, and Flash Card feed, so that I can understand the match at a glance.
4. As an anonymous fan, I want the live experience to be based on one shared data projection, so that every viewer sees a consistent interpretation of what happened.
5. As an anonymous fan, I want a replay to use the same Match Room concepts as live viewing, so that a finished match is not a second-class experience.
6. As a replay viewer, I want to pause, scrub, and change playback speed independently, so that I can revisit moments at my own pace.
7. As a replay viewer, I want historical Flash Cards and predictions to be read-only, so that the record is not altered by watching later.
8. As a fan, I want the field visualization to use zones, ambient possession pressure, and semantically plausible markers rather than fabricated coordinates, so that its presentation remains honest about the feed.
9. As a fan, I want confirmed significant events represented as persistent Flash Cards, so that I have a readable match record.
10. As a fan, I want transient field reactions to communicate the feeling of a moment without duplicating the persistent Flash Card record.
11. As a fan, I want Possible signals to be visually distinct ambient tension, so that I do not mistake them for confirmed actions.
12. As a fan, I want unconfirmed actions to remain lightweight and provisional, so that unsettled information never becomes a permanent card, prompt, recap item, or prediction outcome.
13. As a fan, I want the app to suppress odds-derived presentation until the StablePrice source is confirmed, so that probability figures never hide an arbitrary bookmaker fallback.
14. As a fan, I want a visible degradation state when the feed is stale or reliability is suspect, so that MatchFlash does not silently imply certainty it lacks.
15. As a fan, I want Reliability Flags and recap data-quality notes to explain corrected or degraded data, so that the verified-data claim remains credible.
16. As a fan, I want Heat to communicate current fixture intensity separately from Impact Score, so that I do not confuse a match-level mood signal with an event-significance decision.
17. As a fan, I want the Lobby HeatBadge to decay naturally, so that an old moment does not make a quiet match look permanently intense.
18. As a fan, I want scorer-dependent copy to fall back gracefully when player detail is unavailable, so that missing coverage does not produce broken cards.
19. As a fan, I want formation visualization omitted until `unitId` semantics are verified, so that MatchFlash does not invent tactical meaning.
20. As an authenticated fan, I want ordinary sign-in through Phantom Connect’s embedded or injected wallet flow, so that participation does not feel like a cryptocurrency prerequisite.
21. As an authenticated fan, I want my verified wallet identity to map to one MatchFlash user, so that my rooms, standings, predictions, and trophies remain associated with me.
22. As an authenticated fan, I want a sign-in nudge only when I choose a gated action, so that anonymous browsing stays uninterrupted.
23. As an authenticated fan, I want to react in the live Match Room or an opt-in room, so that I can participate without changing the shared fixture record.
24. As an authenticated fan, I want live reactions and predictions to record live participation, so that the Digital Trophy is an honest attendance keepsake.
25. As a replay viewer, I want any supported replay interaction to be non-qualifying for the Digital Trophy, so that a later viewing session is not represented as live attendance.
26. As a fan, I want every fixture to have one global Match Room, so that the default experience is always available without social friction.
27. As a fan, I want to join public or private opt-in rooms, so that I can add social context without fragmenting the fixture’s facts.
28. As a room member, I want room-specific reactions and standings, so that my social context feels meaningful.
29. As a room member, I want chat that is scoped to my room, so that conversations do not leak across rooms.
30. As a room member, I want the chat to be rate-limited and read-only after the fixture freezes, so that it remains lightweight and time-bounded without pretending to provide full moderation.
31. As a room member, I want the installed message and message-scroller UI primitives to provide an accessible mobile chat experience, so that discussion does not crowd out the Match Room.
32. As a fan, I want a single prompt for a fixture moment to appear consistently in every unfrozen room, so that the same match question does not settle differently by room.
33. As an authenticated fan, I want to answer a prompt only once, so that I cannot produce conflicting answers by moving between rooms.
34. As an authenticated fan, I want my answer’s room to affect only room standings, so that rooms remain social context rather than separate versions of the match.
35. As a fan, I want Next Goal prompts to offer either team or no further goals, so that the full-time outcome is represented explicitly.
36. As a fan, I want Penalty Outcome prompts to remain open through a retake, so that a two-stage penalty lifecycle is settled fairly.
37. As a fan, I want only confirmed active source events to settle predictions, so that discarded or provisional actions do not decide standings.
38. As a fan, I want an affected settled prompt to be voided when a source correction clearly invalidates it, so that MatchFlash does not preserve unsupported points.
39. As a fan, I want ambiguous late corrections to be reviewed rather than silently changing my result, so that uncertain data handling is explicit.
40. As a fan, I want every correct prediction to earn one point and all other outcomes to earn zero, so that standings are simple and contain no stake-like mechanics.
41. As a fan, I want no prediction multiplier, streak, payout, prize, or trophy advantage, so that the product remains entertainment rather than gambling-shaped.
42. As a finished-match visitor, I want a Recap Receipt with shared match facts and data-quality information, so that the match has a useful public record while the license permits it.
43. As a qualifying participant, I want my personal prediction record, standings, and Digital Trophy claim affordance on the Recap Receipt, so that my participation is recognized without hiding the shared recap from others.
44. As a qualifying participant, I want to claim a free, sponsored, soulbound Digital Trophy explicitly, so that I control whether a commemorative asset is minted to my wallet.
45. As a qualifying participant, I want the Digital Trophy to be unrelated to my prediction accuracy, so that it remains a keepsake rather than a performance reward.
46. As a qualifying participant, I want the app to prevent duplicate claims, so that each eligible user receives at most one trophy for a fixture.
47. As a qualifying participant, I want the app to state truthfully when the active trophy run is fully claimed, so that it does not promise a new supply before one has been operationally provisioned.
48. As a participant who missed the immediate claim window, I want a claim-only Archive Mode path after data expiry, so that I can mint a metadata-safe trophy without restoring licensed match content.
49. As a user visiting after the TxLINE license expires, I want an intentional archive explanation instead of an empty or broken Match Room, so that I understand why match data is no longer available.
50. As a user visiting after expiry, I want the Lobby, landing page, terms, and technical documentation to remain navigable, so that the product does not disappear when licensed data must be removed.
51. As the operator, I want one backend worker to own upstream streams and resume state, so that TxLINE credentials remain private and viewer count does not create upstream calls.
52. As the operator, I want raw events written before interpretation, so that reconciliation, empirical verification, replay, and incident diagnosis have an authoritative source record while retention is permitted.
53. As the operator, I want the exact tree rent calculated and displayed before Mainnet creation, so that no cNFT infrastructure spend is estimated or hidden.
54. As the operator, I want Devnet validation before the small Mainnet trophy run, so that wallet, metadata, non-transferability, and mint behavior are proven without Mainnet risk.
55. As the operator, I want all licensed data and non-public derivatives removed at the configured license-expiry instant, so that the product respects time-limited data rights.

## Implementation Decisions

- This is a greenfield implementation over the current Next.js/Convex starter. The primary seam is a fixture-scoped **Match Room projection**: a single public read model containing the safe fixture state, classified timeline, reliability state, room context, and Archive Mode state needed by the UI. Live and replay rendering consume this contract; raw TxLINE payloads never reach browsers.
- Use a mobile-first Next.js UI with anonymous public reads. The Lobby, Match Room, Recap Receipt, Archive Mode, profile/settings, terms, and technical documentation are product surfaces. Use the installed shadcn primitives, including message and message-scroller for chat.
- Define Convex schema and indexes for users, fixtures, stable match projections, high-churn live-feed health, rooms, memberships, raw source events, classified Flash Cards, typed prompts, predictions, reactions, chat messages, Recap Receipts, proof records, trophy trees, trophy claims, minimal trophy eligibility, and correction/manual-review records. Model high-churn feed health separately from stable profile data.
- `users` has a unique auth subject derived server-side from the authenticated Convex identity’s canonical token identifier. The verified Phantom wallet public key is the relevant immutable wallet subject; do not accept user IDs or identity keys from client mutation arguments.
- Configure Convex custom JWT authentication and provide authenticated clients through the auth-aware Convex provider. Require authenticated identity for reactions, predictions, chat, room membership, and claims; keep Match Room and Lobby reads anonymous.
- A dedicated, operator-owned self-hosted Node worker runs on an already-owned always-on Windows machine and owns TxLINE Mainnet level-12 score and odds SSE connections, credentials, reconnect behavior, gzip handling, heartbeat filtering, and `Last-Event-ID` resume state. Windows Task Scheduler starts it at boot and restarts it on failure. The worker makes only outbound TxLINE and Convex connections. It writes to a narrowly authenticated ingestion boundary that invokes internal Convex processing; browser code never calls TxLINE and sensitive writes are not exposed as general public mutations.
- Store every upstream event before normalization. Dedupe by source message identity and reconcile amendments, discards, score adjustments, player-stat adjustments, suspension, and reliability signals before projecting fan-facing state.
- The worker and projection pipeline must support the same stored classified timeline for live viewing and per-viewer replay. Replay state, playhead, pause, speed, and scrub selection remain client-local and are not persisted as a room-wide clock.
- Capture and retain a development-only empirical fixture trace before enabling penalty goal classification. Do not decide whether a scored penalty is a separate goal until the actual feed sequence is observed.
- Classify confirmed events into Flash Cards using the adopted Impact Score and Heat references. Keep Possible signals and unconfirmed action signals non-permanent. Do not create individual Flash Cards for ordinary shots or standalone possession events.
- Keep Impact Score internal. Persist Heat as a decaying fixture-level accumulator with Flash Card, cross-room activity, and sustained possession-intensity contribution paths; clamp only for display.
- Do not enable the probability strip or odds-swing Flash Cards until live taxonomy discovery identifies the exact StablePrice consensus market and bookmaker row. The feature must be absent or explicitly unavailable, never backed by a fallback bookmaker.
- Gate formation rendering on verified `unitId` behavior. The phase-one field visualization—pitch, ambient edge glow, and goal/card/VAR/corner reactions—must remain complete without it.
- Maintain one automatic global room per fixture. Public and private rooms are optional social layers. Freeze rooms at final status; frozen rooms reject chat writes and do not create new prompts.
- Chat messages have room, author, body, and timestamp. The server verifies membership, enforces the defined send-rate limit, and returns bounded/paginated history. Full moderation, room administration, invitations, and host transfer are not introduced.
- A Flash Card owns at most one canonical typed prompt. A prompt is visible in all unfrozen rooms. A prediction has one user and one prompt, and its stored room identifies the room leaderboard context. Enforce one prediction per user per prompt transactionally.
- Implement only the `nextGoal` and `penaltyOutcome` templates. Each template has a machine-readable rule key, fixed options, exact lock and settlement states, exact source-event dependencies, and a void rule. Fan-facing copy may describe the rule but does not determine settlement.
- Award exactly one point for a correct prediction; award zero for loss or void. Leaderboards are standings only and may not introduce stakes, multipliers, streaks, payouts, prizes, or prediction-performance-based Digital Trophy effects.
- If a correction unambiguously affects a settled prompt, atomically void the prompt’s predictions, remove awarded points from all affected standings, and add the appropriate Recap Receipt data-quality note. Queue ambiguous late corrections for manual review in Convex rather than changing results speculatively.
- A live reaction or live prediction creates/updates a server-owned trophy eligibility record. Replay interactions never qualify. The eligibility record is intentionally smaller than retained match data and contains only user, fixture, live eligibility timestamp, and claim status.
- Implement Recap Receipt visibility as a query-time policy: public viewers receive shared match content while license-permitted; qualifying participants additionally receive personal standings, prediction history, and the claim affordance.
- Validate the complete Bubblegum V2 flow on Devnet before Mainnet. Mainnet starts with one non-public 32-leaf tree using `maxDepth: 5` and `maxBufferSize: 8`. Immediately before creating every tree, calculate its account size with the selected SDK configuration, query the current rent-exempt lamports, display/log the amount, and only then submit the creation transaction.
- Mint a free, sponsored, soulbound Digital Trophy through an explicit claim. Enforce unique user-fixture claims transactionally. Metadata contains only independently public fixture facts—teams, competition, final score, and date—plus MatchFlash claim information; exclude prediction performance, Heat, and eventfulness tiers.
- If a tree is full, show that the current run is fully claimed. A new 32-leaf tree may be provisioned only by an explicit operator decision based on observed demand; do not promise replenishment before it exists.
- License expiry is a required configuration value obtained from written authoritative confirmation, not inferred from the July 19 submission deadline or July 29 winner announcement. Before it, permitted normal live/replay/recap behavior continues. At it, stop ingestion, turn off all TxLINE-backed public data reads, and delete raw data plus non-public derivatives in safe batches.
- Archive Mode replaces Match Room data UI with a clear license-expiry explanation and marks match data unavailable in the Lobby. It retains landing, terms, and technical documentation. It retains only minimal trophy eligibility and claim state, allowing a claim-only path for seven days after the configured expiry; it does not resurrect match events, odds, Heat, proofs, recaps, or replay.
- The terms page may retain the contact-email placeholder only until a MatchFlash-controlled address is available. It is a release gate and must be replaced before public release.

## Testing Decisions

- Test externally visible behavior through the Match Room projection seam rather than asserting internal helper calls or database patch sequences. A good test supplies source events or persisted fixture conditions and asserts the public fixture state, Flash Cards, prompts, standings, recap visibility, or Archive Mode response a user receives.
- Add Convex integration tests with `convex-test`, Vitest, and the edge-runtime environment. The repository has no product tests yet, so this becomes the testing prior art.
- Test anonymous reads and gated writes: Lobby and Match Room are readable while signed out; reactions, predictions, chat, membership, and claims reject unauthenticated callers; callers cannot supply another user’s identity.
- Test source ingestion and replay parity: deduplication, raw-before-projection persistence, stream resumption inputs, state reconciliation, live projection updates, and equivalent replay timeline output.
- Test classification boundaries: Possible and unconfirmed events do not create persistent Flash Cards/prompts; discarded events retract appropriate projections; reliability flags gate card generation; score adjustments affect period reliability; ordinary shots and standalone possession do not flood cards.
- Test the three empirical gates as feature flags: penalty-goal classification, StablePrice odds output, and formation rendering stay disabled until their observations are recorded.
- Test Heat decay and contribution caps through observable HeatBadge values and fixture projection updates, including cross-room activity aggregation and possession throttling.
- Test room behavior: exactly one global room per fixture, permission boundaries for public/private rooms, freeze behavior, bounded chat history, rate limit rejection, and room-local leaderboard attribution.
- Test prompt behavior: one canonical prompt per Flash Card, one answer per user despite room changes, fixed lock behavior, Next Goal settlement at next active goal/full time, Penalty Outcome retake behavior, and no replay-created prediction.
- Test correction behavior: unambiguous corrections void predictions, remove points from room/match/app standings, and create a data-quality note; ambiguous late corrections create a manual-review item without silently rewriting a user outcome.
- Test trophy behavior: only live participation creates eligibility; duplicate claim protection is atomic; non-eligible/replay-only users cannot claim; tree-full messaging makes no replenishment promise; and permanent metadata contains no personal performance or Heat/eventfulness field.
- Test the tree-creation preflight by asserting the account-size and rent query occur before any creation submission, without asserting a fixed SOL amount.
- Test Archive Mode end to end: at configured expiry ingestion/data reads stop, licensed content is unavailable, Archive Mode remains coherent, minimal claim eligibility remains, and the claim-only path closes exactly seven days later.
- Add responsive UI tests for the mobile Match Room, prediction lock state, chat drawer, reliability banner, Recap Receipt visibility, capacity state, and Archive Mode explanation. Use browser-level tests only for visible behavior and accessibility interactions.

## Out of Scope

- Multi-sport or multi-competition ingestion beyond World Cup soccer and the existing cheap future-facing `sport` hook.
- A native mobile application.
- On-chain predicate settlement, proof-backed prediction outcomes, or any use of the predicate validator in the first version.
- Individual Flash Cards for ordinary shots or standalone possession events.
- Formation/tactical interpretation before `unitId` verification.
- Odds-derived UI before StablePrice taxonomy confirmation.
- Additional prediction templates beyond Next Goal and Penalty Outcome.
- Token rewards, entry fees, staking, payouts, prediction-linked prizes, multipliers, streak systems, or performance-based trophy tiers.
- Full chat moderation, room administration, invite regeneration, host transfer, or a polished custom operations dashboard.
- A 16,384-capacity cNFT tree, automatic tree replenishment, or a public promise that a depleted run will be replenished.
- Retaining or publishing TxLINE-backed match content, odds, Heat, proofs, replay, recap, or non-public derivatives after license expiry.
- Replacing the terms contact-email placeholder with an address that has not yet been provided and controlled by MatchFlash.

## Further Notes

- The source design package and `07-implementation-readiness-decisions.md` remain the product source of truth; this spec operationalizes them for implementation.
- The three remaining empirical integration checks—penalty/goal sequence, StablePrice canonical row, and `unitId` semantics—are release gates for their dependent features, not reasons to block the unrelated core Match Room.
- The exact license-expiry timestamp is an external confirmation gate. Configure it only after written confirmation from the applicable TxLINE/hackathon authority.
- The spec intentionally preserves anonymous access, replay parity, and honest representation of available data as non-negotiable constraints.
