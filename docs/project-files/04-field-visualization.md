# 2.5D Field Visualization

Sits below the scoreboard, above the Flash Card feed, on `/match/[id]`. Works identically for live and replay, since it consumes the same classified event stream that creates Flash Cards — never a second, independent parse of raw TxLINE messages (Design Principle 4).

## The one fact that shapes everything else

**No positional or tracking data exists anywhere in the soccer feed.** No ball or player coordinates, live or otherwise. This isn't a limitation to work around quietly — it's the decisive fact that makes this a zone-based, event-anchored visualization rather than a position-tracking one, and every decision below follows from taking that seriously rather than faking around it (Design Principle 1).

## The honesty test for "movie magic"

Cinematic presentation is welcome; fabricated precision is not. The test: dramatize a real signal as vividly as you like — never invent one. A glow that brightens as possession intensity climbs is honest. A coordinate readout implying a tracked ball position would not be. Every element below was chosen against this test.

## Layer 1 — the pitch itself

A tilted-perspective trapezoid (narrower far edge, wider near edge — genuine vanishing-point depth from the geometry itself, not a uniform CSS tilt applied to a flat rectangle), horizontal, not vertical. Build this in SVG/CSS, not a 3D engine — a real 3D pipeline (three.js or similar) is genuine overkill for a 2.5D look and a real mobile-performance risk sitting above everything else competing for a phone's attention during a live match.

Individual elements on the pitch should carry their own subtle 2.5D treatment too, not just the outer trapezoid — flattened ellipses instead of circles for the center circle and player shadows, perspective-consistent goal boxes, elements scaling slightly with their notional depth on the pitch.

## Layer 2 — ambient, continuous signal

**Edge-glow, not a center-field blob.** Driven continuously by team-level possession and its intensity (from the dedicated possession-intensity events, not just the embedded field), a soft glow at the edges of the field — which side, how intense — reads at a glance from peripheral vision, the way a broadcast pressure meter does, without competing for visual attention with player tokens or event markers in the center of the pitch.

**An approximate ball marker**, if included: moves in discrete jumps between zone-centers as territory/intensity changes, never glides continuously (continuous motion implies tracking that doesn't exist), rendered soft/semi-transparent so it visually reads as "general area," not a precise position.

## Layer 3 — schematic formation

Real lineup data (`positionId`/`unitId`), grouped into rough banks and arranged within each team's half, updated live through `players_on_the_pitch`/`.adjustment` as substitutions and red cards change who's actually out there. Jersey colors pulled directly from the feed's real color enum — not guessed, not generic. Player numbers on tokens, straightforwardly, since roster numbers are real data.

One honest caveat: `unitId` is a bare number in the spec with no legend for what each value tactically means. Verify empirically what the values actually correspond to before building anything like "tactical shift" storytelling on top of it — the formation-grouping use is solid; anything more specific is unconfirmed until checked against a live fixture.

**On "who has the ball," precisely:** the feed never gives a continuous ball-carrier player — possession is team-level only, except at the instant of a discrete event (a shot, a goal, a card), where a specific player _is_ attached. Show a player's name and number tied to the moment they did something, not as a continuously-tracked "currently on the ball" readout — the latter isn't buildable honestly, and the former is arguably more meaningful anyway.

## Layer 4 — event reactions

The field itself reacts to goals, cards, VAR, penalties, and corners with a brief, tasteful visual flourish — a flash/pulse in the scoring team's jersey color for a goal, a marching-style border for a VAR review in progress, a soft glow at the corner flag for a corner. Event markers anchor to plausible, semantically-appropriate zones (goal mouth, corner flag, center circle) — never a real coordinate, since none exists.

**Moment vs. record — how this relates to the Flash Card feed.** A brief (1–2 second) on-field reaction is the _feeling_ of a moment — like a stadium screen flashing — while the Flash Card in the feed below is the persistent, interactive _record_ of it, carrying the explanation and any embedded prediction. These have different jobs and different timescales; they shouldn't duplicate each other. A large, sustained overlay competing with the Flash Card feed for the same information is the wrong shape — see "what we deliberately didn't build," below.

## Layer 5 — broadcast-style texture, non-persistent

A small weather indicator (rain/wind/clear), sourced from the real `weather` action and updated live if conditions change mid-match — a genuine, honest atmosphere beat most teams wouldn't think to keep watching after kickoff. Small transient chips (a player's name/number/flag popping in briefly for a card or substitution, then out) fit a broadcast lower-third register and don't need to persist on screen.

## Reporter commentary, specifically

Real, pre-written text from the `comment` action is genuinely valuable texture — more authentic and cheaper than synthetic copy — but needs discipline:

- Gate to `severity: warning` only; routine `info` comments never reach the fan-facing surface.
- Throttle spacing between comment-sourced moments even if several warnings cluster close together, so the experience can't flood.
- Give comment-sourced content a visibly distinct treatment from structured, verified events (a quote-style border or icon, not the same chrome as a goal or card) — a comment is a human's observation, not a verified action, and the presentation should let a fan tell the difference at a glance without reading the text (Design Principle 1, applied to tone as much as data).

## Build order

Given how many ideas have accumulated for this one component, sequence matters:

1. **First:** the pitch itself, the ambient edge-glow, and reactions for the four events Impact Score already privileges most — goal, card, VAR, corner.
2. **Then:** the schematic formation layer (jersey colors, player numbers, unit-based grouping).
3. **Then:** the remaining event reactions (penalty, shot/woodwork, injury), the approximate ball marker, the weather indicator, and the broadcast-style transient chips.

Don't build all of this simultaneously — the ambient layer plus the four core event reactions is a complete, honest, genuinely alive-feeling v1 on its own.

## What was looked at and deliberately not adopted

A second AI's own attempt at this component was reviewed purely for ideas, not as a spec. Two patterns worth adapting: a data-driven event→icon/color lookup table (good architecture regardless of visual style — a new event type becomes a table row, not new logic), and timeline dots that light up as a scrub-bar playhead passes them — but only for **replay**, where the full event list already exists; this idea cannot apply to live mode without either showing the future or becoming redundant with the feed that already exists.

Left behind, deliberately: a large, bouncy "GOAL!" overlay with confetti, shimmer sweeps, scan-lines, and a pool of randomized generic hype text. The randomized text is itself a small honesty problem — synthetic flavor presented as reactive, when real reporter commentary exists for exactly this purpose on the occasions it's available. The aesthetic skews toward generic flashiness at odds with a product whose whole pitch is restraint and honesty about data, and stacking that many simultaneous animations is a real mobile-performance and clutter risk directly above an already-active Flash Card feed. Most importantly: that reference implementation was mocking its own data, free to invent ball and player coordinates because nothing constrained it. Copying its solution here would mean fabricating exactly the false precision this whole design has been careful to avoid — its problem and this one are not the same problem.

Also explicitly rejected: any literal coordinate or position readout, for a ball or a player, anywhere in the UI. If it isn't tracked, it isn't displayed as if it were.
