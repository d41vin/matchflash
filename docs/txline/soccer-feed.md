[**World Cup 2026 Free Coverage**\\ \\ Get free access to World Cup & International Friendlies data with TxLINE’s complimentary tiers. Real-time and 60-second delayed options available.](https://txline.txodds.com/documentation/worldcup)

##

[​](https://txline.txodds.com/documentation/scores/soccer-feed#coverage)

Coverage

For a complete list of upcoming soccer fixtures and competitions covered by TxLINE, please refer to the [Schedule](https://txline.txodds.com/documentation/scores/schedule).

##

[​](https://txline.txodds.com/documentation/scores/soccer-feed#on-chain-specifications)

On-Chain Specifications

These specifications define how soccer game phases and statistics are encoded for on-chain operations, including cryptographic validation and trading settlement.

###

[​](https://txline.txodds.com/documentation/scores/soccer-feed#game-phase-encoding)

Game Phase Encoding

| Name | ID  | Description                    |
| ---- | --- | ------------------------------ |
| NS   | 1   | Not started                    |
| H1   | 2   | First half in play             |
| HT   | 3   | Halftime                       |
| H2   | 4   | Second half in play            |
| F    | 5   | Ended (finished)               |
| WET  | 6   | Waiting for Extra Time         |
| ET1  | 7   | Extra Time first half in play  |
| HTET | 8   | Extra Time halftime            |
| ET2  | 9   | Extra Time second half in play |
| FET  | 10  | Ended after Extra Time         |
| WPE  | 11  | Waiting for Penalty Shootout   |
| PE   | 12  | Penalty Shootout in progress   |
| FPE  | 13  | Ended after Penalty Shootout   |
| I    | 14  | Interrupted                    |
| A    | 15  | Abandoned                      |
| C    | 16  | Cancelled                      |
| TXCC | 17  | TX Coverage Cancelled          |
| TXCS | 18  | TX Coverage Suspended          |
| P    | 19  | Postponed                      |

###

[​](https://txline.txodds.com/documentation/scores/soccer-feed#stat-period-encoding)

Stat Period Encoding

Stats are encoded as `period_prefix + base_key`. These encodings are used for on-chain validation proofs and trading settlement. **Full Game Stats (Keys 1-8):**

| Key | Statistic                        |
| --- | -------------------------------- |
| 1   | Participant 1 Total Goals        |
| 2   | Participant 2 Total Goals        |
| 3   | Participant 1 Total Yellow Cards |
| 4   | Participant 2 Total Yellow Cards |
| 5   | Participant 1 Total Red Cards    |
| 6   | Participant 2 Total Red Cards    |
| 7   | Participant 1 Total Corners      |
| 8   | Participant 2 Total Corners      |

**Period Prefixes:**

| Prefix | Period  | Example                                       |
| ------ | ------- | --------------------------------------------- |
| 0      | Total   | `8` = Participant 2 total corners             |
| 1000   | H1      | `1001` = Participant 1 H1 goals               |
| 2000   | HT      | `2001` = Participant 1 halftime goals         |
| 3000   | H2      | `3001` = Participant 1 H2 goals               |
| 4000   | ET1     | `4001` = Participant 1 ET1 goals              |
| 5000   | ET2     | `5001` = Participant 1 ET2 goals              |
| 6000   | PE      | `6001` = Participant 1 penalty shootout goals |
| 7000   | ETTotal | `7008` = Participant 2 ETTotal corners        |

**Usage:** These encodings are required when validating score data against on-chain Merkle roots, creating trading offers, or settling trades with cryptographic proofs.

###

[​](https://txline.txodds.com/documentation/scores/soccer-feed#integrator-notes)

Integrator Notes

- Hydration breaks are represented as `comment` actions with `Data.Text = "Water-drinking break"`. They are not numeric `Stats` keys or a dedicated action type.
- Fouls are not exposed as a separate documented `foul` action in the soccer feed. Use `free_kick` with `Data.FreeKickType != "Offside"` for foul/free-kick handling; offside is `free_kick` with `Data.FreeKickType = "Offside"`.
- Current documented enums include:
- `shot.Data.Outcome`: `OnTarget`, `OffTarget`, `Woodwork`, `Blocked`
- `Data.FreeKickType`: `Safe`, `Attack`, `Danger`, `HighDanger`, `Offside`
- `var.Data.Type`: `Goal`, `Penalty`, `RedCard`, `SecondYellowCard`, `CornerKick`, `MistakenIdentity`, `Other`
- `var_end.Data.Outcome`: `Stands`, `Overturned`
- penalty outcomes: `Scored`, `Missed`, `Retake`

##

[​](https://txline.txodds.com/documentation/scores/soccer-feed#documentation)

Documentation

[**Download**\\ \\ Complete documentation for the TxODDS Soccer data feed](https://txodds.github.io/tx-on-chain/assets/txodds-soccer-feed-v1.1.pdf)

###

[​](https://txline.txodds.com/documentation/scores/soccer-feed#version-1-1-updates)

Version 1.1 Updates

The v1.1 Soccer Feed PDF includes the following integrator-facing updates:

- `Substitution` messages can include `FollowsAction`, linking a confirmed substitution to the originating unconfirmed action.
- `Action Amend` can include `Participant`, identifying the team related to the original action being amended.
- `halftime_finalised` indicates halftime data has been reviewed and verified, and may be sent more than once for the same halftime period.

Was this page helpful?

YesNo

[Schedule](https://txline.txodds.com/documentation/scores/schedule) [American Football Feed](https://txline.txodds.com/documentation/scores/football-feed)

Ctrl+I
