# TxLINE ingestion hosting without Railway

Researched 2026-07-17. This note does not change implementation tickets or ADRs.

## Decision

There is **no verified managed, no-card, zero-cost platform suitable for the
unchanged Ticket 03 design**: a permanently running Node process that owns two
authenticated TxLINE SSE connections.

The best no-payment alternative is to **replace the persistent stream worker
with a Cloudflare Workers Free scheduled pull pipeline**. A Cron Trigger starts
a small Workflow every five minutes; it fetches the completed score and odds
historical five-minute buckets after a stored watermark (with an overlapping
bucket), and forwards each unmodified batch to a narrowly authenticated Convex
ingest boundary. Convex stores/deduplicates raw items before projection.

Cloudflare makes the Free plan available by default and requires a primary
payment method to purchase services. Its documentation does not explicitly
promise that every sign-up flow is card-free, so create the account/deploy only
on Free without a billing profile; abandon this option if the UI asks for one.
[Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
and [billing-profile requirements](https://developers.cloudflare.com/billing/get-started/create-billing-profile/).

This is viable because TxLINE documents historical replay and no API rate
limit for its World Cup free tier, and the repository's captured TxLINE
sitemap lists both historical five-minute score/odds endpoints and the full
score-sequence endpoint. It is **not real-time**: allow up to about five
minutes plus scheduler delay, and verify the actual endpoint authentication,
retention, completeness, and correction behavior against Mainnet before making
this a product decision. [TxLINE free-tier capture](../../docs/txline/world-cup-free-tier.md)
and [captured API sitemap](../../docs/txline/txline-txodds-com-sitemap.xml).

## Operating constraints

- On Workers Free, a Worker has 10 ms CPU time per invocation, five Cron
  Triggers per account, and 100,000 requests/day. Workflow Free limits include
  10 ms CPU per step, 3,000 steps/day, 50 external subrequests per instance,
  1,024 steps per instance, and three-day state retention.
  [Workers limits](https://developers.cloudflare.com/workers/platform/limits/),
  [Workflow limits](https://developers.cloudflare.com/workflows/reference/limits/),
  and [Workflow pricing](https://developers.cloudflare.com/workflows/reference/pricing/).
- Keep each run small: fetch a completed time bucket, forward raw JSON, and
  let Convex do the transactional persistence. Do not parse a live SSE stream
  in the Worker. Prototype actual payload sizes/CPU first; 10 ms may be too
  tight for large batches.
- Persist a watermark and source IDs in Convex, request an overlap on every
  run, and treat every replayed record as an idempotent insert. This preserves
  raw-before-projection and replay capture across missed schedules.
- A Worker/Workflow is not a substitute for infinite SSE: a continuously
  parsing stream risks the 10 ms step budget and the Workflow subrequest/step
  limits. For HTTP Workers, post-response `waitUntil` work is also cancelled
  after 30 seconds. [Cloudflare execution context](https://developers.cloudflare.com/workers/runtime-apis/context/).

## If real-time SSE remains non-negotiable

Run the existing Node worker on an already-owned, always-on computer (for
example Windows Task Scheduler at boot plus restart-on-failure). It only needs
outbound TxLINE and Convex connections, so it needs no public inbound endpoint,
host account, card, or hosting bill. Persist the resume checkpoint after every
raw write and reconnect on process/network restart. This keeps the Ticket 03
architecture intact, but availability is now tied to that computer, power, and
network; validate TxLINE resume retention before relying on it for outage
recovery.

## Shortlist / exclusions

| Option | Card-free / cost result | Fit |
| --- | --- | --- |
| Cloudflare Workers Free + checkpointed historical pull | Best candidate; Free is default, but card-free sign-up is an inference rather than an explicit guarantee. | Good only if five-minute-ish latency is acceptable. |
| Self-hosted Node process | No hosting account/card/cost beyond equipment, power, and internet already owned. | Only option here that preserves the persistent real-time SSE design. |
| Hugging Face Docker Space | Free `cpu-basic`; payment card or grant is required for hardware upgrades. It sleeps after 48 hours of inactivity. | Demo fallback only; a Docker container can run arbitrary apps, but the forced sleep makes it unsuitable as the authoritative always-on worker. [Docker Spaces](https://huggingface.co/docs/hub/en/spaces-sdks-docker), [runtime/billing](https://huggingface.co/docs/hub/spaces-gpus), [hardware management](https://huggingface.co/docs/huggingface_hub/guides/manage-spaces). |
| GitHub Actions scheduled pull | Standard runners are free for public repositories. The shortest schedule is five minutes, schedules may be delayed/dropped, and public-repo schedules disable after 60 inactive days. | Useful only as a non-critical scheduler/keepalive, not capture-grade ingestion. [Billing](https://docs.github.com/en/actions/concepts/billing-and-usage), [schedule behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows). |
| Render | No free Background Worker type; free web services sleep after 15 minutes and may be suspended for high outbound traffic. | Reject. [Render free instances](https://render.com/docs/free). |
| Koyeb | One free web service exists, but it cannot be a Worker Service, scales to zero after one hour without traffic, and the Starter plan requires a valid payment method. | Reject. [Instances](https://www.koyeb.com/docs/reference/instances), [organization plans](https://www.koyeb.com/docs/reference/organizations). |
| Fly.io | Trial is two VM-hours over seven days; continued usage requires payment method. | Reject. [Fly trial](https://fly.io/docs/about/free-trial/). |
| Oracle Cloud Always Free | Perpetual compute exists after trial, but Oracle says most users need a credit card for registration/verification. | Reject. [Oracle Free Tier](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier.htm). |

## Recommendation

Do not create another Railway account. First choose one of these deliberately:

1. **Recommended for a no-card managed deployment:** accept delayed updates
   and prototype the Cloudflare historical-pull path against a live/dev fixture.
   Only revise Ticket 03 after that probe confirms the historical API closes the
   expected gaps and the free CPU limit handles real payloads.
2. **Recommended when the original real-time requirement is strict:** run the
   Node SSE worker on an already-owned always-on machine for the hackathon.

If neither latency nor self-hosting is acceptable, paid hosting (or renewed
Railway access) is unavoidable for the original persistent-worker requirement.
