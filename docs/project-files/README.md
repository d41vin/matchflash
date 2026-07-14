# MatchFlash — Final Documentation Package

Everything needed to build MatchFlash for the TxLINE World Cup Hackathon, Consumer & Fan Experiences track — the product of a full design process that included reading the entire TxODDS soccer feed spec directly, verifying pricing and the hackathon's actual terms rather than assuming them, and redesigning every major system with that understanding in hand.

## Reading order

| File                                    | What it's for                                                                                                                                |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `matchflash-what-makes-us-different.md` | The product thesis — not marketing copy. Read this first; check any new decision against it.                                                 |
| `matchflash-design-principles.md`       | Nine rules for how to decide anything not already covered elsewhere.                                                                         |
| `00-project-brief.md`                   | Vision, scope, pages, the compliance/timing context that shaped everything, the representative user journey. Start the technical docs here.  |
| `01-txline-integration-reference.md`    | Auth flow, verified pricing/network facts, the full message catalog, on-chain validation mechanics, licensing constraints.                   |
| `02-data-model.md`                      | The complete Convex schema.                                                                                                                  |
| `03-event-pipeline-and-flash-cards.md`  | Impact Score, Heat, the Flash Card catalog, correction handling, and the full evaluation of why on-chain prediction settlement was deferred. |
| `04-field-visualization.md`             | The 2.5D field visualization in full — what it can and can't honestly show, and why.                                                         |
| `05-cnft-and-recap.md`                  | The trophy claim flow, tree provisioning, conservative metadata rules, sharing.                                                              |
| `06-build-plan.md`                      | Risk-ordered build sequence (no time estimates — Claude Code isn't time-boxed), and an explicit list of what was deliberately cut and why.   |
| `terms-and-privacy.md`                  | The actual `/terms` page content — a real deliverable, not implementation guidance.                                                          |
| `reference/heat.ts`                     | Heat, implemented — now with the possession-intensity contribution path.                                                                     |
| `reference/impact-score.ts`             | Impact Score, implemented — VAR-by-review-type, two-stage penalties, the narrative bonus, the corrected multiplier tiers.                    |
| `reference/odds-normalizer.ts`          | Odds normalization — payload shape confirmed accurate; the StablePrice canonical-row hypothesis noted for live confirmation.                 |
| `reference/stat-keys.ts`                | Stat key encoding — unchanged, re-confirmed against the live spec.                                                                           |

## Five things worth knowing before you start

1. **The tournament is further along than it looks from a standing start.** Replay is a first-class experience, not a fallback — see the brief §2.
2. **Judges may not need a wallet to evaluate this.** The full core experience works signed out; keep it that way.
3. **TxLINE's data license ends with the hackathon and restricts sharing the Data** — this is why the cNFT metadata is deliberately conservative. See `05` for exactly what's in and out.
4. **On-chain predicate settlement was seriously considered and deliberately deferred** — a real idea, fully evaluated, documented rather than either dropped silently or forced in. See `03` §7.
5. **Every "cheap hook, no infrastructure yet" field exists on purpose** — `fixtures.sport`, `prompts.settlementMethod`. Building the infrastructure behind them is future work; the fields cost nothing today.
