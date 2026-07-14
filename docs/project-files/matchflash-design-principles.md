# MatchFlash — Core Design Principles

Nine rules, converged on across the whole design process, meant to outlive any single feature discussion. When a new decision comes up that isn't covered by an existing doc, check it against these before improvising.

## 1. Honesty over precision-theater

Never let the product imply the data knows more than it actually does — in code or in pixels. This is the single most load-bearing principle in the whole design. It's why the field visualization is zone-based rather than pretending to track positions the feed doesn't provide, why the approximate ball marker jumps between zones instead of gliding continuously, and why the on-chain validator gets described as proving threshold claims rather than exact values. If a visual or a piece of copy would make a technically literate person feel misled once they knew exactly what data fed it, it doesn't ship.

## 2. Keep the blockchain invisible until someone chooses to see it

Sign-in should read as ordinary web onboarding ("Continue with Google"), never as "connect your wallet." Anonymous browsing must always cover the full core experience. Wallet-specific language and concepts only surface at the moment someone opts into something that's actually wallet-specific — claiming a trophy, say. This is both a UX principle and close to a compliance one, given judges shouldn't need an account to evaluate the submission.

## 3. Nothing here is a stake, a wager, or a prize for being right

Leaderboards are standings, not payouts. The trophy is free, participation-gated, and soulbound — its value never scales with how good someone's predictions were. Any new feature gets checked against this before it ships, not after.

## 4. One interpretation of "what happened," expressed as many times as needed

The field visualization and the Flash Card feed both render the same underlying classified events — neither re-parses raw TxLINE messages independently. Heat and Impact Score are allowed to be two different numbers because they answer two different questions, not because they're two different guesses at the same one. If two systems ever need to agree on a fact, there should be exactly one place that fact gets decided.

## 5. Provisional stays provisional until confirmed

An unconfirmed action can produce a lightweight, clearly-provisional signal — never a full Flash Card, never a prompt, never anything that touches a settled prediction or a recap. A `Possible` event is ambient tension, not a preview of a specific outcome it may never share an ID with. Nothing enters the permanent record before it's real.

## 6. When something's degraded, say so

A stale live feed gets a banner, not silence. A period with a Score Adjustment gets treated as reliability-suspect for its other stats, not quietly trusted. A recap with a mid-match reliability flag gets a data-quality note, not a clean story that skips the messy part. Reinforcing "verified" means being honest about the moments it wasn't.

## 7. The core experience needs no account, ever

Watching, browsing the Lobby, following a Match Room — all of it works signed out. Sign-in gates participation (reacting, predicting, chatting, claiming), never comprehension.

## 8. Build the smallest thing that earns its place; leave a cheap hook for the rest

A `sport` field on fixtures today, not a multi-sport pipeline. A `settlementMethod` field on prompts today, not an on-chain settlement system. Convex's own table view instead of a custom admin dashboard. The pattern throughout: cheap, forward-compatible data now; real infrastructure only once there's a real second use for it.

## 9. Mobile-first is the default lens, not a checklist item

Every UI decision — tap over hover, sheets over full-page navigation, a collapsible chat panel over a permanent tab, lightweight SVG/CSS over a 3D engine for the field — gets made assuming a phone in one hand during a match, not retrofitted onto a desktop-first layout afterward.

---

_Two refinements folded in while assembling the rest of these documents, worth noting here since they came directly from applying these principles rather than from new information: Impact Score's "final 15 minutes" multiplier is scoped to regular time only, since extra-time periods are already covered by their own, higher dedicated multiplier and would otherwise double-count (Principle 4 — one fact, not two overlapping guesses at it). And a Score Adjustment now automatically marks its period's other stats as reliability-suspect rather than only noting it in prose (Principle 6, made structural rather than just narrative)._
