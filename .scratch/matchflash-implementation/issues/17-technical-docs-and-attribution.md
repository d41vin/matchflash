# 17 — Technical docs and attribution

**What to build:** Judge-facing technical documentation and dependency attribution based on the real integration that shipped.

**Blocked by:** 03 — TxLINE worker, raw events, and replay capture; 05 — Classified timeline and core Flash Cards; 07 — StablePrice discovery and odds presentation.

**Status:** ready-for-agent

- [ ] The technical surface identifies actual TxLINE endpoints, message categories, source-processing boundaries, and installed dependencies used by MatchFlash.
- [ ] It clearly distinguishes shipped behavior from deferred on-chain settlement and empirically gated odds/formation features.
- [ ] It demonstrates that browser clients do not call TxLINE and that the product uses shared, real data rather than mocks.
