# MatchFlash — Project Brief (Final)

Built for the TxLINE World Cup Hackathon, Consumer & Fan Experiences track. This is the vision-and-scope document — for the reasoning behind _why_ it's shaped this way, see `matchflash-design-principles.md` (how we decide) and `matchflash-what-makes-us-different.md` (what makes this worth building at all). For anything technical, this brief points to the dedicated doc rather than repeating it.

## 1. What this is

A live, second-screen companion for World Cup matches: real match data, verified against TxLINE's on-chain-anchored feed, turned into a shared room where a match becomes something to watch _with_ people and something worth keeping a record of afterward — never something to bet on.

## 2. Context that shapes the scope

- **The hackathon has a real deadline.** Winners are announced July 29, 2026. Verified directly against the hackathon terms, not assumed.
- **The tournament clock matters more than it first appears.** By the time this build starts in earnest, the World Cup is already in its knockout rounds, with limited live-match runway left before both the tournament and the judging window close. Replay is built as a first-class experience from day one, not a fallback.
- **Judges may not be required to hold a wallet to evaluate the submission**, per the hackathon's own terms. The core experience — Lobby, Match Room, Flash Card feed, field visualization — works fully signed out; sign-in only gates participation. The demo video and `/docs` carry the weight of proving the participation features work, rather than requiring a judge to personally connect anything.
- **TxLINE's data license is hackathon-scoped and terminates when the hackathon concludes**, and explicitly prohibits redistributing or sharing the underlying Data beyond that. This directly shaped the cNFT trophy design: metadata is limited to independently-public match facts (score, teams, date) rather than TxLINE-specific payloads or proof identifiers. If a future version wants to go further, that's a conversation with TxODDS first, not an assumption.
- **Gambling-law compliance is an explicit condition of participation**, not just good branding. Every design decision that keeps MatchFlash clearly on the "commemorative, not wagering" side of the line is doing real compliance work, not just positioning.
- **FIFA/World Cup branding restrictions are contractual**, not just prudent — see `terms-and-privacy.md`.

## 3. Product surfaces

| Route                             | Purpose                                                                                                                                                                                                     |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `matchflash.vercel.app` (landing) | Marketing/pitch entry point                                                                                                                                                                                 |
| `/lobby`                          | Sport tabs (only soccer enabled; others disabled with an animated "coming soon" interaction). Live + upcoming matches first; past World Cup matches available too, held through the hackathon's conclusion. |
| `/match/[id]` — "Match Room"      | Where everyone lands from the Lobby. Scoreboard → 2.5D Field Visualization → Flash Card feed. Works identically in live and replay states.                                                                  |
| `/match/[id]/room/[roomId]`       | Opt-in public or private sub-room: chat, room-scoped reactions, room leaderboard.                                                                                                                           |
| Profile/settings                  | Display name, avatar, wallet address, sign out, and a history list of every match with a qualifying participation record, each linking to its permanent recap.                                              |
| `/terms`                          | Full Terms/Disclaimers/Privacy — see the dedicated file.                                                                                                                                                    |
| `/docs`                           | Technical documentation for judges: real endpoints, message IDs used, and the architecture notes that prove this is built on genuine TxLINE data, not mocked.                                               |

`Match Room` join/create, leaderboards, Flash Cards, the field visualization, cNFT claim flow, and reliability handling all have their own dedicated documents — see §8.

## 4. MVP scope

**In scope:** one competition (World Cup 2026), soccer only, the full live + replay Match Room experience, predictions with real settlement, a free participation-gated soulbound cNFT trophy, public/private rooms with chat and their own leaderboard, an app-wide leaderboard, and a recap that's genuinely worth keeping.

**Explicitly out of scope for this version:**

- Multisport support (the `sport` field and disabled Lobby tabs exist so this is additive later, not a migration)
- A native mobile app (this is a responsive, mobile-first _web_ app)
- Token rewards or anything resembling a payout — the cNFT trophy is deliberately distinct from this: free, equal for everyone who qualifies, never tiered by performance
- On-chain predicate settlement for predictions — evaluated deliberately and deferred; see `03-event-pipeline-and-flash-cards.md` §7
- Room admin features, chat moderation tooling beyond a basic rate limit, and a polished internal ops dashboard — see the build plan's "explicitly cut" list for the full reasoning on each

## 5. User journey (representative)

A fan opens MatchFlash mid-tournament. No sign-in needed to land on `/lobby` — Group Stage has already passed, so Round of 16 and Quarterfinal matches are what's live or upcoming, with a note that only Soccer is available today (other sport tabs sit there, clearly disabled, hinting at what's next). They tap a live match and land directly in its Match Room — no intermediate screen. The scoreboard sits at the top; below it, the field visualization glows faintly at one edge, showing which side is pressing; below that, the Flash Card feed is quiet for now.

A corner is won. A small marker pulses at the corner flag on the field. Nothing dramatic yet — corners alone rarely clear the bar for a full card. Ninety seconds later, a shot cracks off the crossbar — the field flashes briefly at the goal mouth, and a Flash Card appears at the top of the feed: "So close! [Player]'s effort comes back off the bar." No prediction on this one; it's not the shape of moment that needs one.

Then a goal. The scoring team's edge of the field pulses in their jersey color for a moment — the feeling of it — while a full Flash Card appears in the feed with the scorer's name, a probability shift, and an embedded prediction: "What happens next?" with a visible 20-second countdown ring. The fan taps to sign in — "Continue with Google" — completes in a few seconds, and taps their answer before the ring runs out.

They tap "Join or Create Room," see three public rooms already going, and join the liveliest one — now there's chat alongside everything the Match Room already had, plus a room leaderboard sitting next to the match-wide one.

The match ends. The Match Room shows FULL TIME, and a Recap button appears. Everyone who watched can see the recap's shared story — headline, biggest swing, the match's most chaotic minute. Because this fan reacted and predicted during the live match, they also see their own prediction record, their standing, and a "Claim Digital Trophy" button. One tap, no gas, no wallet complexity — free, sponsored, done. Their trophy shows up in their profile's history, permanently.

## 6. Auth

Phantom Connect SDK (embedded wallet via Google/Apple for casual users, browser-extension connect for existing wallet holders), bridged to Convex via a self-signed JWT after verifying a wallet signature server-side, using Convex's built-in `"customJwt"` provider. No Clerk, Privy, or Dynamic. Full detail in `01-txline-integration-reference.md` §Auth.

## 7. Tech stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui, Convex (database, functions, file storage, real-time subscriptions), Phantom Connect SDK, Metaplex Umi + `mpl-bubblegum` (V2) + `mpl-core` for the cNFT, Helius (free tier) for DAS API reads.

## 8. Where everything else lives

| Document                                | Covers                                                                                                                                  |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `matchflash-design-principles.md`       | The nine rules that should govern any decision not already covered elsewhere                                                            |
| `matchflash-what-makes-us-different.md` | The product thesis, and what's deliberately deferred to a post-hackathon version                                                        |
| `01-txline-integration-reference.md`    | Auth flow, verified pricing/network facts, the full message catalog, on-chain validation mechanics                                      |
| `02-data-model.md`                      | The complete Convex schema                                                                                                              |
| `03-event-pipeline-and-flash-cards.md`  | Impact Score, Heat, the Flash Card catalog, correction handling, prediction settlement (including why on-chain settlement was deferred) |
| `04-field-visualization.md`             | The 2.5D field visualization, in full                                                                                                   |
| `05-cnft-and-recap.md`                  | The trophy claim flow, tree provisioning, metadata rules                                                                                |
| `06-build-plan.md`                      | Risk-ordered build sequence and what was deliberately cut                                                                               |
| `terms-and-privacy.md`                  | The actual `/terms` page content                                                                                                        |
