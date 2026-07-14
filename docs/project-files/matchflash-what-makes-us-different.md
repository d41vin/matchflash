# What Makes MatchFlash Different

Not marketing copy. This exists to check every remaining implementation decision against, and to shape what the demo actually shows judges. If a feature doesn't serve one of the ideas below, it's a candidate for cutting — see `06-build-plan.md` for what that meant in practice.

## The bet, in one line

A live match companion earns trust by being honest about exactly what it knows — real, cryptographically verifiable data, presented without fake precision and without gambling-shaped incentives — and that honesty is what makes a match worth remembering, not just watching.

## The seven ideas

**1. Verified data is the spine, not a badge bolted on.**
Almost every "trust" feature in sports apps is decorative — a checkmark, a "powered by" logo. MatchFlash's is structural: TxLINE's Merkle-anchored data genuinely backs the recap, the reliability notes are honest about when something was flagged uncertain, and — most tellingly — the field visualization refuses to fake precision the data doesn't support. That refusal is itself evidence the "verified" claim is real, not marketing.

**2. One room, not a maze.**
Pick a match, land directly in the Match Room. No lobby-then-preview-then-join friction that most companion and prediction apps force on you before anything actually happens. Private and public rooms are an optional social layer on top of the default experience, never a prerequisite for it.

**3. Predictions with real stakes of time.**
A ~20-second lock window, a visible countdown, a card that goes quiet the instant it's over. Most prediction features let you answer whenever, which makes them feel like a quiz. This is built to feel like being there.

**4. A trophy that's a keepsake, not a wager.**
Free, participation-gated (you had to actually be in the room, not just claim later), soulbound so it structurally cannot be resold or flipped. POAP plus Spotify Wrapped, not a prize ladder. This is a deliberate, structural distance from the prediction-market and fantasy-crypto products that occupy the rest of this hackathon's other tracks.

**5. Replay as an equal citizen — honestly, not by design purity alone.**
This started as a necessity: by the time this was built, the tournament was already deep into the knockout rounds, leaving little live-match runway before judging closed. It became a real principle worth keeping regardless — a finished match gets the same Flash Card feed, the same field visualization, the same predictions-as-they-were-made, not a stripped-down afterthought.

**6. A field that tells the truth.**
No positional tracking exists in the data, so the visualization doesn't pretend it does. Zone-based ambient pressure, event markers anchored to plausible zones, an approximate ball that jumps between zones rather than gliding. This is a constraint turned into a design principle — and a lighter, more mobile-friendly one than fake tracking would have been anyway.

**7. Heat and Impact Score: two honest signals, not one fuzzy one.**
Most apps have a single, vague "excitement" number. This one deliberately keeps two: Impact Score decides what's significant enough to become a Flash Card (internal, per-event), Heat is the mood of the whole match right now (external, per-match, shown on the Lobby). Keeping them separate is what makes each one mean something specific.

## What's explicitly planned for after the hackathon, not before

- **On-chain predicate settlement for headline predictions** — evaluated carefully and deliberately deferred (see `03-event-pipeline-and-flash-cards.md` §7 for the full reasoning). Real implementation cost, real added latency against an already-tight prediction window, real new failure modes in a trust-critical system, and low judge-visible benefit relative to just documenting the idea well. The `prompts.settlementMethod` field exists now specifically so this can be added later without a schema migration.
- **Multi-sport and multi-competition expansion** — the `sport` field and disabled Lobby tabs exist now; the actual pipeline work (a second sport's stat model, weight table, card catalog) is real, substantial work that shouldn't start before World Cup soccer is solid.
- **Tiered/longer replay retention** for an always-on future product, versus "everything, through the hackathon" for this one.
- **Room admin features** (kick, invite regeneration, host transfer) — safe to skip now because rooms are already time-bounded by the match; not safe to skip forever if rooms become a persistent feature.
- **Chat moderation tooling** beyond a basic send-rate limit.
- **A real internal operations dashboard** — Convex's own built-in table view covers this for now.
- **A proper "browse your history" experience** beyond the simple profile list this version ships with.

## What was deliberately left out, and why

See `06-build-plan.md`'s "Explicitly cut" section for the full list with reasoning — individual Flash Cards for ordinary shots and possession events, a polished admin dashboard, the more theatrical end of broadcast-style field overlays, and building every field-visualization idea at once rather than in a deliberate order. None of these were forgotten. Each one was weighed against the seven ideas above and didn't clear the bar for this version.
