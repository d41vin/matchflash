# 03 — TxLINE worker, raw events, and replay capture

**What to build:** A single operator-owned, self-hosted TxLINE Mainnet level-12 ingest path that persists each source event once, resumes safely, and retains replay-ready source capture.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] The worker, not a browser, owns authenticated score and odds streams, heartbeats, reconnection, and resume state.
- [ ] Every source event is stored before downstream interpretation and duplicates do not create a second record.
- [ ] Stored capture can supply a replay input without making a new TxLINE request.

## Comments

- **2026-07-17 — Hosting decision update:** The worker runs on an already-owned, always-on Windows machine rather than Railway. Windows Task Scheduler starts it at boot and restarts it on failure. It has outbound-only TxLINE and Convex connections; no public endpoint, tunnel, or managed-host configuration is part of this ticket. This supersedes the original Railway ownership wording while preserving the persistent, real-time SSE architecture.
