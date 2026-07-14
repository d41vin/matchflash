# Event Pipeline, Flash Cards, Heat & Impact Score

The full design behind how a TxLINE message becomes something a fan sees — redesigned after a complete read of the actual soccer feed spec, not the earlier partial pass. Where something changed from the original design, it says so and says why.

---

## 1. Pipeline (end to end)

1. **Ingest** — SSE message arrives from `/api/scores/stream` or `/api/odds/stream`. Heartbeats filtered here.
2. **Store raw** — every message written to `txlineEvents` with `status: "active"`, before any interpretation.
3. **Reconcile** — `action_amend`/`action_discarded` update the targeted event and any dependent `flashes`/`predictions` row; `score_adjustment`/`player_stats_adjustment` are authoritative overwrites, not amends to a specific action.
4. **Reliability check** — `suspend` (via `Data.Reliable`), `unreliable_corners`, `unreliable_yellow_cards` update `matchStates.reliability`. A `score_adjustment` additionally sets `periodSuspectSinceAdjustment` automatically for that period's other stats — this is now structural, not just a recap footnote (Design Principle 6).
5. **Normalize odds** — through the odds normalizer, writing `matchStates.oddsProvenance` + the three `winProb*` fields.
6. **Update match state** — score, card, corner, clock, phase, possession, odds.
7. **Classify** — determine flash type (§3) and compute Impact Score (§2).
8. **Confirmed gate** — unconfirmed actions produce only a lightweight, clearly-provisional signal — never a full card, prompt, settlement, or recap entry (Design Principle 5). `possible` events are handled separately (§4) since they're structurally not the same kind of provisional.
9. **Threshold check** — create a `flashes` row (and `prompts` if the type supports prediction) if Impact Score clears the threshold.
10. **Update Heat** — if a confirmed flash was just created, apply its contribution (§2b) in the same mutation.
11. **Push** — Convex propagates to subscribed clients.
12. **Settle** — prompts settle from later, confirmed data only, per §6.

---

## 2. Impact Score — per event, internal, gates card creation

Never shown to users directly. Decides whether an update becomes a Flash Card, and lets cards be compared against each other for a recap's "biggest swing."

```
impactScore =
    ( eventWeight + oddsSwingWeight + varWeight + possessionWeight + narrativeBonus )
      × matchStakesMultiplier
      × final15Multiplier (regular time only — see below)
      × confirmationMultiplier
```

**Event weights:**

| Signal                                                                                     | Weight                                                                                                                              |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Goal                                                                                       | +60                                                                                                                                 |
| Own goal                                                                                   | +60 (same weight — the match impact is identical; the _copy_ changes tone, not the score)                                           |
| Red card                                                                                   | +45                                                                                                                                 |
| Penalty awarded                                                                            | +20                                                                                                                                 |
| Penalty scored                                                                             | +55                                                                                                                                 |
| Penalty missed                                                                             | +30                                                                                                                                 |
| Penalty retaken                                                                            | +15                                                                                                                                 |
| Halftime/fulltime phase change                                                             | +15                                                                                                                                 |
| Corner in final 10 minutes                                                                 | +12                                                                                                                                 |
| Shot hitting the woodwork                                                                  | +18 (the _only_ shot outcome that becomes its own card — every other shot feeds ambient possession signal only, or the feed floods) |
| Odds probability swing > 10 points                                                         | +30                                                                                                                                 |
| Odds probability swing > 20 points                                                         | +50                                                                                                                                 |
| Underdog lead or comeback                                                                  | +25                                                                                                                                 |
| Injury, outcome: not returning, merged with its resulting substitution via `FollowsAction` | +12                                                                                                                                 |
| Injury, other outcomes                                                                     | +5 (rarely worth a card alone)                                                                                                      |
| Comment, severity: warning                                                                 | +15 to +30 depending on the specific content (a coach's dismissal, e.g., sits at the high end)                                      |
| Additional time announced (≥ 3 min)                                                        | +8                                                                                                                                  |
| Sustained high-danger possession                                                           | +5 per interval, capped (ambient, feeds Heat — see §2b)                                                                             |

**VAR — weighted by review type, opening and resolution both:**

| Review type        | Opened | Resolved: stands | Resolved: overturned |
| ------------------ | ------ | ---------------- | -------------------- |
| Goal               | +25    | +15              | +55                  |
| Penalty            | +25    | +15              | +50                  |
| Red Card           | +22    | +15              | +45                  |
| Second Yellow Card | +20    | +15              | +40                  |
| Corner Kick        | +10    | +8               | +20                  |
| Mistaken Identity  | +8     | +8               | +20                  |
| Other              | +15    | +12              | +25                  |

This replaces the original flat +20/+40/+15 — a review that could disallow a goal isn't the same event as a review of a corner, and the feed tells you which one you're looking at.

**Narrative bonus — new, uses per-player running totals already present on every goal message:**

| Condition                                      | Bonus |
| ---------------------------------------------- | ----- |
| Same player's 2nd goal this match (brace)      | +15   |
| Same player's 3rd+ goal this match (hat-trick) | +30   |

**Match-stakes multiplier — replaces the old flat knockout multiplier with escalating tiers, since these are mutually exclusive game phases, not independent facts that stack:**

| State                        | Multiplier |
| ---------------------------- | ---------- |
| Knockout match, regular time | ×1.2       |
| Knockout match, extra time   | ×1.35      |
| Penalty shootout             | ×1.5       |

**Final-15-minutes multiplier — scoped to regular time only.** Extra-time periods are 15 minutes by rule (per `GameType` on the `standby` message — read the actual period length from this rather than hardcoding 45/15, in case a lower-tier competition ever differs), which means "final 15 minutes" would be true for nearly the entire ET period and double-count against the extra-time tier above. Applying it only within H1/H2 avoids that overlap (Design Principle 4 — one fact, expressed once).

| State                                       | Multiplier |
| ------------------------------------------- | ---------- |
| Final 15 minutes of regular time (H1 or H2) | ×1.25      |

**Confirmation multiplier:** Confirmed ×1.0, Unconfirmed ×0.4 (and hard-capped below the card-creation threshold — see §4).

**What's deliberately _not_ a card at all, regardless of weight:** ordinary shots (anything but `Woodwork`), and the standalone possession-intensity events. Both feed the ambient signal (Heat, and the field visualization's edge-glow) continuously, never the discrete Flash Card feed. Carding every shot would flood the feed within minutes of any match starting.

---

## 2b. Heat — per match, user-facing, drives the Lobby's HeatBadge

A stored, decaying accumulator — updated by a Convex mutation, never recomputed inside a query.

```
newHeat = (oldHeat × decayFactor(minutesSinceLastUpdate, halfLife: 6min)) + contribution
```

**Three contribution paths, one new:**

1. **A confirmed Flash Card is created** — `min(impactScore × 0.3, 25)`. Naturally rate-limited by construction.
2. **Room activity** (reactions + predictions) — `min(recentActivityCount × 0.5, 15)`, throttled to at most once per 20 seconds per fixture. **Aggregated across every room tied to the fixture, never per-room** — a small, very active private room shouldn't be able to swing a fixture-wide signal as much as the whole public crowd can.
3. **Sustained possession intensity — new.** The dedicated possession-intensity events are frequent and granular enough to be a genuine "this match feels alive" signal even through a stretch with no card-worthy discrete event. Contributes a small, capped amount per sustained high-danger/danger interval, same throttling discipline as room activity.

**Deliberately excluded:** weather, and any administrative/reliability signal (`connected`/`disconnected`, `suspend`). Heat describes match excitement, not data quality or ambient conditions — folding those in would blur two things that should stay separate (Design Principle 4).

`matchStates.heat` is unbounded; clamp for display. Half-life (6 min) is still a starting guess — tune once real matches are being watched.

---

## 3. Flash Card catalog

| Flash type                           | Trigger                                                                  | Prediction? | Notes                                                                                                                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `goal`                               | Confirmed goal                                                           | Optional    | `GoalType` drives copy tone — own goals read differently, same weight                                                                                                              |
| `card`                               | Confirmed red/yellow                                                     | No          |                                                                                                                                                                                    |
| `corner`                             | Confirmed, weighted by game time                                         | Sometimes   |                                                                                                                                                                                    |
| `oddsSwing`                          | Normalized win-probability delta over threshold                          | Sometimes   |                                                                                                                                                                                    |
| `anticipation`                       | `Possible` event, any flag true                                          | No          | Ambient tension, not a preview of a specific card — see §4                                                                                                                         |
| `varReview` / `varResolved`          | VAR opened/resolved                                                      | No          | Copy and weight both reflect review type                                                                                                                                           |
| `penaltyAwarded` / `penaltyResolved` | Two-stage, mirrors VAR                                                   | Sometimes   | Verify empirically whether a scored penalty also fires a separate `goal` action                                                                                                    |
| `shot`                               | `Woodwork` outcome only                                                  | No          | Every other shot outcome: ambient signal only                                                                                                                                      |
| `injury`                             | Merged with resulting substitution via `FollowsAction` where one follows | No          | Soft, low-visual-weight tone — concern, not excitement                                                                                                                             |
| `comment`                            | Severity: warning only                                                   | No          | Distinct visual treatment from structured events — a quote-style border/icon, not the same chrome as a verified action. Real reporter text, not synthetic copy, wherever available |
| `additionalTime`                     | ≥ 3 minutes announced                                                    | No          |                                                                                                                                                                                    |
| `weather`                            | Conditions change, including mid-match                                   | No          | Quiet, atmosphere-only treatment — never competes visually with action cards                                                                                                       |
| `atmosphere`                         | Pre-kickoff weather/venue/jersey/lineups                                 | No          | Neutral-venue-aware — use the `venue` action directly, never assume home-crowd energy                                                                                              |
| `possessionPressure`                 | Ambient only                                                             | No          | Feeds Heat and the field viz edge-glow, never a discrete card                                                                                                                      |

---

## 4. Confirmed / unconfirmed, and `Possible` specifically

Unconfirmed actions (goal, red card, etc. with `Confirmed: false`) may produce a very lightweight, clearly-provisional UI signal at ×0.4 weight, hard-capped below `CARD_THRESHOLD` — never a full card, never a prompt, never anything touching a settled prediction or recap.

`Possible` is structurally different, not just "the unconfirmed version of the above." It's a standalone, always-final signal that doesn't share an ID with whatever it's hinting at, and it may never resolve into anything concrete at all. Treat it as ambient tension — "something's brewing" — never as a specific preview a fan should expect to see confirmed. This is a correction to how the original design implicitly treated the two as the same mechanism.

If an action is discarded before confirmation, the provisional signal simply disappears — nothing was ever recorded, so nothing needs retracting.

`comment` with `Data.Severity: "action_invalid"` specifically signals a discard too far in the past to auto-adjust the score — route this straight to the same manual-review path as a discard-after-settlement, rather than surfacing it to fans at all.

---

## 5. Reliability gating

Check `matchStates.reliability.cornersReliable`/`.cardsReliable` before generating those card types; hold off on any new card while `dataSuspended` is true. `periodSuspectSinceAdjustment` (§1) extends this automatically whenever a `score_adjustment` fires — treat that period's corner/card stats as suspect until the next `halftime_finalised` or an explicit clearing signal, not just until someone remembers to note it.

At match end, if any reliability flag ever fired, say so plainly in `recaps.dataQualityNote` — Design Principle 6.

---

## 6. Prediction settlement

Ordinary prompts settle from this app's own confirmed pipeline state, exactly as before. `prompts.settlementMethod` exists as a field specifically to allow a second kind of settlement later without a schema migration — see §7 for why it isn't used yet.

---

## 7. On-chain predicate settlement — evaluated and deferred

The strongest single idea to come out of reading the on-chain validation mechanism directly: your prediction prompts already ask threshold-shaped questions ("will there be another goal," "will Team A win by 2+"), and the validator's predicate system is built around exactly that shape of claim. In principle, "was this prediction correct" and "can we cryptographically prove it" could be the same question for a match's headline predictions.

Evaluated deliberately, not adopted reflexively:

- **Implementation cost:** substantial. Fetching Merkle proof data from a separate endpoint, correctly constructing a predicate, fixture summary, and proof arrays, deriving the right PDA by epoch day, and managing a near-max compute-budget simulation — a genuinely separate subsystem, not an extension of the existing pipeline.
- **Latency:** directly opposed to something that matters more — prompts already lock in roughly 20 seconds. A proof round-trip on top of that risks undermining the "feels instant" quality the whole prediction loop depends on.
- **New failure modes, in the worst place to have them:** a stalled or broken on-chain settlement doesn't fail quietly — it leaves a fan's prediction outcome stuck in the one system whose entire value proposition is trustworthy correctness.
- **Judge-visible benefit is low relative to the cost.** A judge testing the app briefly is very unlikely to personally experience a live settlement round-trip and register it as meaningfully different from ordinary settlement. Most of the benefit is capturable just by documenting the idea clearly — which the hackathon's own submission format explicitly rewards.

**Decision: deferred, not built, for this version.** Documented here and in `matchflash-what-makes-us-different.md` as a deliberate post-hackathon direction. The only thing kept now is the `settlementMethod` field itself, since leaving that hook costs nothing.
