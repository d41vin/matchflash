# Host TxLINE ingestion in one persistent worker

One Railway-hosted Node worker owns the authenticated TxLINE SSE connections, reconnect logic, and `Last-Event-ID` resume state. It writes shared raw events and projections to Convex; browsers never call TxLINE, Vercel serves only the Next.js UI, and Convex remains the shared database and realtime subscription layer.
