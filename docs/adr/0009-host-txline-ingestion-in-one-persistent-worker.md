# Host TxLINE ingestion in one persistent worker

One self-hosted Node worker, operated on an already-owned always-on Windows machine, owns the authenticated TxLINE SSE connections, reconnect logic, and `Last-Event-ID` resume state. Windows Task Scheduler starts it at boot and restarts it on failure. The worker makes only outbound TxLINE and Convex connections. It writes shared raw events and projections to Convex; browsers never call TxLINE, Vercel serves only the Next.js UI, and Convex remains the shared database and realtime subscription layer.

## Decision update — 2026-07-17

The original Railway deployment choice is superseded because its available account tier does not provide usable no-cost worker capacity. Self-hosting preserves the required persistent, real-time SSE design without a hosting account, card, or platform bill. This makes availability dependent on the operator machine, power, and network; the worker must therefore persist its resume checkpoint after every raw write and reconnect safely after process or network failure.
