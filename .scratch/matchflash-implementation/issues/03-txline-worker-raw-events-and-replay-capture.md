# 03 — TxLINE worker, raw events, and replay capture

**What to build:** A single Railway-owned TxLINE Mainnet level-12 ingest path that persists each source event once, resumes safely, and retains replay-ready source capture.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The worker, not a browser, owns authenticated score and odds streams, heartbeats, reconnection, and resume state.
- [ ] Every source event is stored before downstream interpretation and duplicates do not create a second record.
- [ ] Stored capture can supply a replay input without making a new TxLINE request.
