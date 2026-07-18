# TxLINE worker on this Windows laptop

Ticket 03 runs one persistent, outbound-only Node process. It owns the authenticated Mainnet level-12 score and odds SSE streams; browsers never call TxLINE. Every non-heartbeat frame is sent to the private Convex ingestion function, which atomically writes the raw frame and its `Last-Event-ID` checkpoint before any later projection work. A restart therefore resumes safely and duplicate frames are ignored.

## One-time setup

1. Install Node.js 20 or newer for all users, so `C:\Program Files\nodejs\node.exe` exists. If Node is elsewhere, set the machine environment variable `MATCHFLASH_NODE_PATH` to its full path.
2. Activate a **Mainnet service-level-12** TxLINE subscription. Start the app locally, open `http://localhost:3000/txline-mainnet`, then use the injected Phantom extension to switch to Mainnet, approve the level-12 four-week transaction, and sign its activation message. The page is unavailable in production and never asks for a private key. Save the returned API token. Do not use the Devnet origin or a level-1 subscription for this worker.
3. Generate a long random `MATCHFLASH_WORKER_SECRET`, then set that same value as a Convex deployment environment variable and in the local `.env.worker`.

   ```powershell
   $secret = [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
   pnpm.cmd exec convex env set MATCHFLASH_WORKER_SECRET $secret
   ```

   Copy `.env.worker.example` to `.env.worker` and populate `TXLINE_API_TOKEN`, `CONVEX_SITE_URL`, and `MATCHFLASH_WORKER_SECRET` (paste `$secret` for the last value). `CONVEX_SITE_URL` is the deployment's HTTP actions site URL, in the form `https://<deployment>.convex.site` (not the browser client URL ending in `.convex.cloud`). The secret protects the two Convex HTTP ingress routes, which in turn call the private ingestion functions; never add it to `.env.local`, source control, or a browser variable. The worker renews its guest JWT after a 401, so `TXLINE_GUEST_JWT` may be left blank. Before deploying, also configure the project's existing Convex auth environment values; the current deployment reports `MATCHFLASH_AUTH_ISSUER` as unset.
4. Deploy the Convex schema and functions, then run `pnpm worker:txline` once from the repository. You should see separate `scores` and `odds` connection messages (and capture messages whenever TxLINE emits non-heartbeat frames). Stop it with Ctrl+C after confirming both streams connect.

## Windows Task Scheduler

Open an elevated PowerShell and register the supplied boot task:

```powershell
Register-ScheduledTask -TaskName "MatchFlash TxLINE worker" -Xml (Get-Content -Raw .\scripts\matchflash-txline-worker.xml) -Force
Start-ScheduledTask -TaskName "MatchFlash TxLINE worker"
```

It starts one minute after boot, waits for networking, runs as LocalSystem, and retries failure every minute. The task uses the checked-in absolute workspace path; if this repository moves, update the two paths in `scripts/matchflash-txline-worker.xml` before registering it again.

Check it with:

```powershell
Get-ScheduledTaskInfo -TaskName "MatchFlash TxLINE worker"
Get-Content .\env.worker
```

The laptop must remain powered, online, and awake for live ingestion. A power or network interruption is safe for already acknowledged frames because Convex commits the raw record and resume checkpoint in one transaction; availability resumes only after the laptop and worker return. Task Scheduler does not make a closed or sleeping laptop live.

## Scope boundary

This worker captures raw data only. Event reconciliation, odds normalization, classification, flash cards, browser-facing replay controls, and archive-mode cleanup belong to later tickets. Replay consumers will read the bounded internal Convex capture rather than contacting TxLINE again.

For an unexpected non-heartbeat frame without an SSE ID, provider message ID, sequence, or action identity, the worker stores it under a hash of the raw bytes and current resume checkpoint. That makes a replayed byte-identical frame idempotent without blocking later capture. Capture a live TxLINE sequence before changing this fallback: it intentionally treats byte-identical frames at the same checkpoint as duplicate delivery because the source supplies no way to distinguish them.
