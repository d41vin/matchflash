# cNFT Trophy & Recap Receipt

## Framing

A free, commemorative proof-of-attendance token — "POAP plus Spotify Wrapped," not a prize or a wager. This is checked against the hackathon's own gambling-compliance requirement and the original brief's "no token rewards" exclusion, and holds up, with one hard rule that governs every decision below: **trophy value or tier never scales with prediction accuracy.** Match-level flavor (a tier keyed to how eventful the match was) is fine; player-performance-based tiering is not — the moment a trophy's worth depends on how well someone predicted, it's drifted into exactly what "not gambling" is meant to rule out.

## Recap Receipt — two layers, one page

| Everyone sees                                                | Only participants see                        |
| ------------------------------------------------------------ | -------------------------------------------- |
| Final score, teams, competition, date                        | Their prediction record for the match        |
| Headline, biggest swing, most chaotic minute (peak Heat)     | Their standing on the match/room leaderboard |
| Data-quality note, if reliability was ever flagged mid-match | The "Claim Digital Trophy" button            |

No separate gate — same page, conditionally rendered. Match-level content is genuinely good, shareable content on its own, and there's no reason to hide it from someone who missed the match.

**Participation, precisely defined:** at least one `reactions` or `predictions` row tied to that fixture. Since predictions are disabled during replay, the mere existence of such a row already proves it happened live — no separate "was connected live" tracking needed. This exact definition also drives the profile's history list.

## Claim flow

Explicit button, never an automatic mint at match-end. Always free to the user, no exceptions — the backend/treasury wallet sponsors every cost.

1. Match ends → Match Room shows FULL TIME → Recap Receipt renders → participants see the claim button.
2. Tap → a Convex action checks `trophyClaims` for an existing `(userId, fixtureId)` row (reject if found) → mints.
3. Mint targets whichever `merkleTrees` row is currently `isActive: true`.
4. On success: record the `trophyClaims` row, show the trophy with a link to view it, offer sharing (see below).
5. If the active tree is full: show, rather than an error —

   > "All free MatchFlash trophies have been claimed for now. Don't worry — we'll be adding more very soon. Please check back later to claim yours."

## Soulbound

Built using Bubblegum V2's non-transferable capability. This isn't just thematically appropriate — it's a structural enforcement of "not gambling," not merely a stated policy. A trophy that literally cannot be resold can't become a speculative asset no matter what anyone tries to do with it.

## Metadata — kept conservative, and why

TxLINE's data license is granted solely for hackathon participation, terminates when the hackathon concludes, and explicitly prohibits redistributing or sharing the underlying Data. An NFT is permanent and publicly readable by design — it doesn't stop existing when a license does. Independently-public facts (final score, teams, date — the kind of thing any broadcast or news site reports) are treated as safe; anything that looks like redistributing TxLINE's specific proprietary payloads or proof identifiers is not, until directly confirmed with the organizers.

**Included:**

- Fixture facts: teams, competition, final score, date
- A flavor tier derived from the match's peak Heat (an "Instant Classic" for a match that ran especially hot) — match-keyed, never player-performance-keyed
- Personal stats as descriptive flavor text (e.g., "predicted 3 of 5 correctly") — informational, never a value tier

**Deliberately excluded, for now:** any direct citation of a specific TxLINE proof identifier, transaction, or raw payload field. If a future version wants to go further here — the "verified receipts" angle is genuinely compelling — that's a direct question to TxODDS first, not an assumption.

**Image:** auto-generated SVG, embedded as a base64 data URI directly inside the metadata JSON — no separate image host needed.

**Hosting:** Convex file storage. `storage.getUrl()` produces a URL that's publicly fetchable with no auth check and stays valid until the file is explicitly deleted — exactly the durability an NFT metadata URI needs. Trade-off accepted knowingly: durability is tied to MatchFlash's own infrastructure continuing to exist, not a decentralized store. Fine for this version; revisit if a future version wants that guarantee instead.

## Full technical stack

| Piece                                              | Role                                                                                                                               | Cost                                                                                                                                        |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `@metaplex-foundation/umi`                         | Base SDK framework                                                                                                                 | Free                                                                                                                                        |
| `@metaplex-foundation/mpl-bubblegum` (**V2 only**) | The compressed-NFT program — `createTreeV2`/`mintV2`. Do not mix with V1 tutorials; V1 and V2 trees/leaves are not interchangeable | Free                                                                                                                                        |
| `@metaplex-foundation/mpl-core`                    | The collection cNFTs belong to (V2 requires Core, not Token Metadata)                                                              | Free (small one-time account)                                                                                                               |
| One Merkle tree                                    | Sized to real expected volume, not a "reference" million-capacity config                                                           | Get the exact figure from `getConcurrentMerkleTreeAccountSize` + a rent-exemption lookup before creating anything on mainnet — no estimates |
| Funded backend keypair                             | Fee payer / tree authority; paid in native SOL, not USDC                                                                           | Budget: $10 total                                                                                                                           |
| Helius (free tier)                                 | RPC + DAS API for reading cNFTs back out                                                                                           | Free — 100,000 calls/month covers this scale comfortably                                                                                    |
| Convex file storage                                | Hosts the metadata JSON (image embedded inside it)                                                                                 | Free, already in stack                                                                                                                      |
| Phantom Connect SDK                                | Supplies the destination public key                                                                                                | Free, already in stack                                                                                                                      |

**Ruled out:** Crossmint and similar minting-as-a-service platforms. Current pricing is pay-per-action (roughly $0.01+), with no confirmed meaningful free tier at this scale, and cost scales linearly with volume forever — a self-owned tree front-loads its cost once and then mints for a fraction of a cent each.

## Tree provisioning — an operational task, not a coding one

```typescript
merkleTrees: defineTable({
  treeAddress: v.string(),
  capacity: v.number(),
  mintedCount: v.number(),
  isActive: v.boolean(),
  createdAt: v.number(),
}).index("by_active", ["isActive"]),
```

Mint logic always targets whichever row is `isActive: true`. A new tree means running the existing, already-tested tree-creation function with new parameters, inserting a new row, and flipping the old row's flag off — a data operation, not a deploy. Previously-minted cNFTs stay valid regardless of how many trees now exist; the DAS API reads by owner address, not by tree, so multi-tree history is invisible to the read path.

**Internal monitoring:** total capacity, minted count, remaining, and a low-capacity warning, sourced directly from this table. Convex's own built-in table view is sufficient for this — a custom admin dashboard is real effort spent on something nobody outside the team will ever see (Design Principle 8).

**Anti-double-claim:** `trophyClaims`, unique on (`userId`, `fixtureId`).

## Rollout discipline

Build and fully validate the entire flow — wallet connection, metadata, soulbound behavior, minting — on **Solana Devnet** first. Only move to Mainnet once fully confident. This is the correct default engineering sequence regardless of which network the final submission runs on, and devnet submissions explicitly qualify for hackathon judging.

## Sharing

Two separate actions, not a combined one:

- **Share Recap** — available to anyone viewing a finished match's recap, participant or not, since match-level content is already open to everyone. Shares the recap image, a short prewritten caption, and a link back to the match.
- **Share Trophy** — only for participants, and only _after_ they've claimed. Never offered pre-claim — sharing an unclaimed trophy would be misleading and would remove the one reason to actually tap "claim."

Primary path: the Web Share API (`navigator.share()`), opening the device's native share sheet pre-loaded with image, caption, and link — a strong fit for a mobile-first app. Fallback where unsupported: copy-link plus download-image.
