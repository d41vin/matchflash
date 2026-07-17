# Implementation-Readiness Decisions

This record captures decisions made during the implementation-readiness grill. It is part of the proposed design package and **supersedes any contrary detail in `00`–`06` or the reference files**. The matching rationale lives in `docs/adr/0001` through `0019`.

## Data, ingestion, and replay

- MatchFlash uses TxLINE Mainnet service level 12 for the production live experience. The TxLINE connection settings must remain network-consistent.
- One operator-owned, self-hosted Node worker runs on an already-owned always-on Windows machine and owns the authenticated TxLINE score and odds SSE streams, reconnection, and `Last-Event-ID` resume state. Windows Task Scheduler starts it at boot and restarts it on failure. It makes only outbound TxLINE and Convex connections, writes each raw message once, and derives shared Convex state once. Browsers never call TxLINE; they subscribe to shared Convex queries. Replay reads stored classified timelines and makes no TxLINE calls.
- Before writing penalty/goal classification, capture a real Mainnet or Devnet stream sequence to establish whether `penalty_outcome: Scored` also emits `goal`. Do not infer a deduplication rule from documentation.
- Do not display the probability strip or create odds-swing Flash Cards until live discovery confirms the exact StablePrice consensus market and bookmaker row. Never substitute an arbitrary bookmaker line.
- The schematic formation layer may ship only after an observed `unitId` mapping is verified. Phase 1 field visualization remains the honest baseline if it is not.
- Replay playback is per viewer and local to the stored classified timeline. There is no shared room replay clock and no persisted room-wide replay state. Historical prompts are read-only.

## Rooms, participation, chat, and auth

- A Flash Card is fixture-level. A prediction prompt is canonical per Flash Card and appears in every unfrozen room; a user may answer it once. The answer records its room only for room standings.
- Trophy eligibility requires a server-recorded live reaction or live prediction. Replay interactions cannot create eligibility.
- Chat uses room-scoped `chatMessages` records with room, author, body, and timestamp. Only authenticated room members may send, server-side rate limiting applies, and frozen rooms are read-only. The installed shadcn message and message-scroller components are the intended UI primitives.
- The verified Phantom wallet public key is the immutable `customJwt` subject and canonical user identity. Store it as `users.authSubject` with a unique lookup; `walletAddress` is its displayable counterpart.

## Predictions and corrections

- Predictions use only typed, deterministic templates. Machine-readable rule keys, fixed options, lock/settlement boundaries, and void behavior determine outcomes; fan-facing settlement copy does not.
- Phase F ships only:
  - `nextGoal`: Team 1, Team 2, or no further goals; settles at the next confirmed active goal or full time.
  - `penaltyOutcome`: scored or not scored; remains open for a retake and is voided by an affecting correction.
- Every correct prediction awards one point. Incorrect and voided predictions award zero. There are no stakes, multipliers, streaks, prizes, or prediction-performance-based trophy effects.
- An unambiguously affected settled prompt is automatically voided: all results become void, its points are removed from all standings, and the recap receives a data-quality note. Ambiguous late corrections are held for manual review in Convex.

## License expiry and Archive Mode

- The confirmed TxLINE license-expiry instant is configuration, not an assumed submission-close or winner-announcement date. Obtain the authoritative date in writing before release.
- Before that instant, the normal live, replay, and recap experience remains available through the judging period when permitted by the license.
- At expiry, stop ingestion; disable public TxLINE-backed replay, recap, event, odds, Heat, proof, and derived-data access; and delete raw TxLINE data and non-public derivatives.
- Preserve a polished Archive Mode: `/match/[id]` shows an explanatory archive screen rather than empty or broken live UI, and `/lobby` marks affected matches unavailable. The landing page, terms, and technical docs remain available.
- Retain only the minimal precomputed `trophyEligibility` record required for a claim-only Archive Mode: user, fixture, eligibility timestamp, and claim status. It contains no TxLINE event or odds data.
- Eligible users may use the Archive Mode claim-only path for seven days after the confirmed license-expiry instant.

## Digital Trophy

- Validate the entire Bubblegum V2 trophy flow on Solana Devnet before any Mainnet mint.
- The initial active Mainnet tree is a non-public Bubblegum V2 tree using `maxDepth: 5` and `maxBufferSize: 8`, with 32 leaves. Never use a 16,384-capacity tree for this project.
- Immediately before a tree is created, calculate its account size with the selected Bubblegum/SPL configuration and call `getMinimumBalanceForRentExemption()` to obtain the exact rent-exempt lamport amount. Display/log that value before spending.
- If the active tree is full, an operator may deliberately provision another 32-leaf tree based on observed demand. The capacity UI must say only that the current run is fully claimed; it must not promise replenishment before another tree exists.
- Permanent cNFT metadata contains only independently public fixture facts (teams, competition, final score, date) and MatchFlash claim information. It excludes personal prediction-performance stats and Heat/eventfulness tiers.

## Remaining verified assumptions and release boundaries

- `terms-and-privacy.md` intentionally retains `[contact email]` until a MatchFlash-controlled address exists. It must be replaced before public release.
- The exact TxLINE license-expiry timestamp remains an external confirmation gate; do not set it from the hackathon calendar by inference.
- The three empirical integration gates are: penalty/goal event shape, StablePrice canonical row, and `unitId` semantics. Their dependent features must remain disabled or omitted until verified.
