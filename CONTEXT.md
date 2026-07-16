# MatchFlash

MatchFlash is an anonymous-first live and replay soccer companion built from TxLINE event data. Its language distinguishes data-backed match signals from the social and commemorative layers built around them.

## Match experience

**Match Room**:
The fixture’s primary, anonymously accessible surface for the scoreboard, field visualization, and Flash Card feed. Public and private Rooms are an optional social layer over this shared experience.
_Avoid_: game room, match lobby

**Flash Card**:
A persistent, fixture-level record of a confirmed and classified match moment. It is distinct from a transient field reaction and from a provisional signal.
_Avoid_: notification, alert

**Impact Score**:
An internal per-event significance score that decides whether a confirmed event earns a Flash Card. It is never presented as a fan-facing measure of excitement.
_Avoid_: excitement score, heat

**Heat**:
A user-facing, decaying per-fixture measure of current match intensity. It is not an event score and does not describe data reliability.
_Avoid_: Impact Score, excitement score

**Possible signal**:
A final TxLINE anticipation event that represents ambient tension without asserting that a later action will occur. It is not an unconfirmed version of a goal, card, or other action.
_Avoid_: provisional event, predicted action

## Trust and commemoration

**Reliability flag**:
An explicit indication that a portion of the feed is degraded or suspect, including period-scoped suspicion caused by a Score Adjustment. It informs presentation and recap data-quality notes; it is not an excitement signal.
_Avoid_: verification status

**Recap Receipt**:
The finished-match page that exposes shared match facts to everyone and personal results or trophy eligibility only to qualifying participants.
_Avoid_: receipt NFT, recap token

**Digital Trophy**:
A free, soulbound commemorative cNFT claimable by qualifying participants. It has no monetary value and never changes value or tier according to prediction accuracy.
_Avoid_: reward, prize, payout
