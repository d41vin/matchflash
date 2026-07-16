# 14 — Mainnet trophy preflight and operator runbook

**What to build:** A guarded Mainnet readiness flow for the 32-leaf Digital Trophy tree, with no automatic or implied spend.

**Blocked by:** 13 — Devnet Digital Trophy claim.

**Status:** ready-for-agent

- [ ] The operator workflow targets a non-public 32-leaf Bubblegum V2 tree and calculates account size plus current rent-exempt lamports before any submission.
- [ ] The preflight displays/logs the exact amount and requires a separate explicit operational approval before a Mainnet tree-creation transaction can be submitted.
- [ ] A full tree communicates only that the current run is fully claimed; a later 32-leaf tree remains an explicit operator decision.
