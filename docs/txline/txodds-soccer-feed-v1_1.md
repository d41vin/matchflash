## Scores Product API documentation

Soccer, version 1.1

TXODDS

3 June 2026 i

## Contents

| Changelog - Version 1.1: . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | 2   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --- |
| Changelog - Version 1.0: . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | 2   |
| Scores Product API documentation . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .     | 2   |
| Accessing the scores data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .        | 2   |
| Messages . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . | 3   |
| Common . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .       | 3   |
| Status Id . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 3   |
| Amend Additional Time Action<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 4   |
| Amend Free Kick Action<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 4   |
| Amend Goal Action . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 4   |
| Amend Penalty Outcome Action . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                   | 4   |
| Amend Red Card Action . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                  | 5   |
| Amend Shot Action . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 5   |
| Amend Substitution Action . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 5   |
| Amend Throw In Action<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .               | 5   |
| Amend VAR End Action<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 5   |
| Amend Yellow Card Action . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                 | 6   |
| Clock . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 6   |
| Kickoff Details . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 6   |
| Lineup Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 6   |
| Participant State<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .           | 7   |
| Player Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 7   |
| Player Lineup Data . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .               | 7   |
| Player on pitch fag . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 8   |
| Player Statistics . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 8   |
| Player Statistics . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 8   |
| Players on Pitch . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 8   |
| PossibleNeutralEvent . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .               | 8   |
| PossiblePartyEvent . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .               | 8   |
| Score . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 9   |
| Score for Participant in Period . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 9   |
| Score for Participant in Period . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 9   |
| Action messages . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .        | 9   |
| Action Amend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .               | 10  |
| Action Discarded . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .               | 11  |
| Additional Time . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 11  |
| Attack Possession<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 12  |
| Clock Adjustment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .               | 13  |
| Comment<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 13  |
| Connected . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 14  |
| Corner . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 15  |
| Danger Possession . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 15  |
| Disconnected<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 16  |
| Free Kick . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 16  |
| Goal<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .          | 17  |
| Goal Kick . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 18  |
| halftime_fnalised . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 18  |
| High Danger Possession . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                 | 19  |
| Injury . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .           | 19  |
| Jersey<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .          | 20  |
| Kickoff . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .            | 21  |
| Kickoff Team . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 21  |
| Lineup . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 22  |
| Lineups<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .           | 23  |
| Penalty Attempt . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 23  |
| Penalty Outcome . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 24  |
| Penalty Shootout Team . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 25  |
| Player Stats Adjustment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 25  |
| Players on the pitch . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 26  |
| Players on the pitch Adjustment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                | 26  |
| Players Warming Up . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .                 | 27  |
| Possession . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 27  |
| Possible<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .          | 28  |
| Red Card . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .             | 29  |
| Safe Possession . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .              | 29  |

1

Scores Product API documentation

3 June 2026

| Score Adjustment . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 30      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Shot<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 30 |
| Standby . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 31     |
| Status<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32 |
| Substitution . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 32    |
| Suspend . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 33     |
| Throw In . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 34    |
| Unreliable Corners<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 34   |
| Unreliable Yellow Cards<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 35    |
| VAR<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 35  |
| VAR End . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 36     |
| Venue<br>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 37  |
| Weather . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 37     |
| Yellow Card . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . 38     |

## Changelog - Version 1.1:

- Added FollowsAction field to Substitution message. Links confirmed substitutions to their originating unconfirmed action.

- Added Participant field to Action Amend message. Indicates the team related to the original action being amended.

## Changelog - Version 1.0:

- Added Kickoff field to Kickoff message.

- Added SecondYellowCard and CornerKick enum values to VAR.

- Added Players on the pitch Adjustment message.

- Added ManualStatusChange field to Status message.

- Added PossessionType field to Action Discarded message.

## Scores Product API documentation

TXODDS Scores is a brand-new product launched in 2024 supplying a first class live scores data offering for Soccer with new sports arriving in the future. The service provides clients with a dedicated endpoint through our Fusion feed to consume real time scores and all important play by play game updates as soon as they happen on the field. A wide range of in-play game actions are covered with both team and player level data included. All updates are generated directly from venues & streams and sent directly to the Scores Fusion feed with high accuracy and the extremely low latency.

Utilising our innovative capture software, specialist trained Scouting network and supporting operational teams TXODDS Scores offers a high performance and rich in-play data feed. Please find more information below regarding the Scores API and a detailed guide to our Soccer data.

## Accessing the scores data

Scores Product data is available for clients as an extension to the TXODDS Fusion subscription. To receive the data, the following endpoints are in use:

1. The Fixtures API endpoint, that indicates which fixtures are going to be covered with scores data;

2. the Scores API endpoint, that provides real-time access to scores information.

Please refer to TXAPI FUSION FEED User Guide, version 1.20:

- Fixtures Usage - p.15;

- Fixtures Message - p.51-53;

- Scores Usage - p.17-18;

- Scores Message - p.58-60.

In summary, the fixture messages are annotated with the following data, available to subscribe as ExtraFields:

| Field                 | Default | Type    | Example    | Description                                                             |
| --------------------- | ------- | ------- | ---------- | ----------------------------------------------------------------------- |
| CoverageStatus        | N       | string  | "Approved" | The status of the Scores Data fxture coverage: Not Approved,            |
|                       |         |         |            | Approved,Cancelled                                                      |
| CoverageType          | N       | string  | "Venue"    | The Scores Data coverage that will be available if approved: Venue,     |
|                       |         |         |            | TV/Stream                                                               |
| CoverageSecondaryData | N       | boolean | true       | Is additional player data available: true,false,null. e.g. for a goal - |
|                       |         |         |            | scorer, assist.                                                         |

2

TXODDS

Scores Product API documentation

3 June 2026

The scores data is available at the /scores endpoint.

Optional scores endpoint parameters:

- Ts (timestamp);

- FixtureId, allows multiple values, separated by a comma e.g. FixtureId=x,y,z.

To get live updates for any fixture that has Score Data available: /scores

To get the history and live updates for specific fixtures that have Score Data available: /scores?Ts=0&FixtureId=123456789,234567890

NOTE: Check the /fixtures endpoint ScoresCaptureTracking=True and the ExtraFields parameter values CoverageType, CoverageStatus, and CoverageSecondaryData to see if Scores Data coverage for the fixture might be available.

NOTE: There is a slight difference in the response when requesting Full Context using Ts=0. All other endpoints will provide the current state e.g. the odds endpoint will return the current state of all available offers. The scores endpoint will however provide a history of the messages rather than current state, but otherwise the Ts parameter works the same, messages greater than or equal to the timestamp will be returned.

Example of a Fusion Scores message in JSON format:

|     | 1   | {                                                   |     |
| --- | --- | --------------------------------------------------- | --- |
|     | 2   | "FixtureInfo": {                                    |     |
|     | 3   | "GameState": "scheduled",                           |     |
|     | 4   | "StartTime": "2024−06−08T21:00:00Z",                |     |
|     | 5   | "IsTeam":true,                                      |     |
|     | 6   | "FixtureGroupId":10074357,                          |     |
|     | 7   | "FixtureGroup": "CL>Playoffs",                      |     |
|     | 8   | "CompetitionId":500005,                             |     |
|     | 9   | "Competition": "Champions League",                  |     |
| 10  |     | "CountryId":459,                                    |     |
| 11  |     | "Country": "EU",                                    |     |
| 12  |     | "SportId":6,                                        |     |
| 13  |     | "Sport": "soccer",                                  |     |
| 14  |     | "Participant1IsHome":true,                          |     |
| 15  |     | "Participant2Id":38298,                             |     |
| 16  |     | "Participant2": "Liverpool",                        |     |
| 17  |     | "Participant1Id":4433,                              |     |
| 18  |     | "Participant1": "F.C Barcelona",                    |     |
| 19  |     | "FixtureId":14790158                                |     |
| 20  |     | },                                                  |     |
| 21  |     | "Update": {                                         |     |
| 22  |     | "Action": "kickoff",                                |     |
| 23  |     | "StatusId":2,                                       |     |
| 24  |     | "Data": {                                           |     |
| 25  |     | "Participant":1                                     |     |
| 26  |     | },                                                  |     |
| 27  |     | "Confrmed":true,                                    |     |
| 28  |     | "Clock": {                                          |     |
| 29  |     | "Running":false,                                    |     |
| 30  |     | "Seconds":756                                       |     |
| 31  |     | },                                                  |     |
| 32  |     | "FixtureId":14790158,                               |     |
| 33  |     | "GlobalSeq":262,                                    |     |
| 34  |     | "Id":241,                                           |     |
| 35  |     | "Ts":1718033066851,                                 |     |
| 36  |     | "ServerId": "3e5e4790−6260−4dd3−858e−dd9c100c122e", |     |
| 37  |     | "Seq":245                                           |     |
| 38  |     | }                                                   |     |
| 39  |     | }                                                   |     |

Please refer to the Fusion feed documentation for FixtureInfo description. The following paragraphs in this document describe the different messages that are sent in the Update field - see Action messages.

## Messages

## Common

The following sections describe the format of fields that can appear in all Fixture Actions, for reference.

## Status Id

Most of the events in the game have a StatusId associated. This ID represents the current phase of the game. Some events refer also to the StatusName. All possible values, along with their meaning, are described in the table below.

| Id  | Name | Game Phase  | Description                        |
| --- | ---- | ----------- | ---------------------------------- |
| 1   | NS   | Not Started | Status before the match is started |
| 2   | H1   | 1st Half    | Match in play during 1st half      |
| 3   | HT   | Half Time   | Half-time of the match             |
| 4   | H2   | 2nd Half    | Match in play during 2nd half      |

TXODDS

3

Scores Product API documentation

3 June 2026

| Id  | Name | Game Phase                            | Description                                                          |
| --- | ---- | ------------------------------------- | -------------------------------------------------------------------- |
| 5   | F    | Finished (Full-Time)                  | Match ends after the 2nd half of regular time                        |
| 6   | WET  | Waiting for Extra Time                | Break after second half before the start of the frst extra time half |
| 7   | ET1  | 1st Half Extra Time                   | The frst half of Extra Time                                          |
| 8   | HTET | HT Extra Time                         | Half-time in Extra Time                                              |
| 9   | ET2  | 2nd Half Extra Time                   | The second half of Extra Time                                        |
| 10  | FET  | Finished (Full-Time) After Extra Time | Match ends after the 2nd half of Extra Time                          |
| 11  | WPE  | Waiting for Penalty Shootout          | Break after Extra Time before the start of a Penalty Shootout        |
| 12  | PE   | Penalty Shootout                      | Penalty shootout in progress                                         |
| 13  | FPE  | Finished After Penalty Shootout       | Game ends after Penalty Shootout                                     |
| 14  | I    | Interrupted                           | The game is offcially interrupted                                    |
| 15  | A    | Abandoned                             | The game is offcially abandoned                                      |
| 16  | C    | Cancelled                             | The game is offcially cancelled                                      |
| 17  | TXCC | TX Coverage Cancelled                 | TX cancelled coverage of the event                                   |
| 18  | TXCS | TX Coverage Suspended                 | TX suspended coverage of the event                                   |

## Amend Additional Time Action

Amend specific info

| Property | Required | Type        | Description                          | Examples             |
| -------- | -------- | ----------- | ------------------------------------ | -------------------- |
| Clock    | yes      | Clock       | SeeClock                             | _See object details_ |
| Minutes  | no       | number,null | Minutes added to the current period. | _null_,_1_,_2_,_6_   |

## Amend Free Kick Action

Amend specific info

| Property     | Required | Type               | Description        | Examples                    |
| ------------ | -------- | ------------------ | ------------------ | --------------------------- |
| Clock        | yes      | Clock              | SeeClock           | _See object details_        |
| FreeKickType | no       | enum(see examples) | Type of Free Kick. | _null_,_“Safe”_,_“Attack”_, |
|              |          |                    |                    | _“Danger”_,                 |
|              |          |                    |                    | _“HighDanger”_,             |
|              |          |                    |                    | _“Offside”_                 |

## Amend Goal Action

Amend specific info

| Property | Required | Type               | Description                                           | Examples                  |
| -------- | -------- | ------------------ | ----------------------------------------------------- | ------------------------- |
| Clock    | yes      | Clock              | SeeClock                                              | _See object details_      |
| GoalType | no       | enum(see examples) | Type of goal.                                         | _null_,_“Shot”_,_“Head”_, |
|          |          |                    |                                                       | _“Own”_,_“Other”_         |
| PlayerId | no       | number,null        | External Id of the player that scored, if applicable. | _null_,_3290005_,         |
|          |          |                    |                                                       | _1290003_,_5020305_       |

## Amend Penalty Outcome Action

Amend specific info

| Property | Required | Type               | Description             | Examples                      |
| -------- | -------- | ------------------ | ----------------------- | ----------------------------- |
| Clock    | yes      | Clock              | SeeClock                | _See object details_          |
| Outcome  | no       | enum(see examples) | Outcome of the penalty. | _null_,_“Scored”_,_“Missed”_, |
|          |          |                    |                         | _“Retake”_                    |

TXODDS

4

Scores Product API documentation

3 June 2026

| Property | Required | Type        | Description                                         | Examples            |
| -------- | -------- | ----------- | --------------------------------------------------- | ------------------- |
| PlayerId | no       | number,null | External Id of the player that took the penalty, if | _null_,_3290005_,   |
|          |          |             | applicable.                                         | _1290003_,_5020305_ |

## Amend Red Card Action

Amend specific info

| Property | Required | Type               | Description                                          | Examples                |
| -------- | -------- | ------------------ | ---------------------------------------------------- | ----------------------- |
| Clock    | yes      | Clock              | SeeClock                                             | _See object details_    |
| PlayerId | no       | number,null        | External Id of the player that received the card, if | _null_,_3290005_,       |
|          |          |                    | applicable.                                          | _1290003_,_5020305_     |
| Type     | no       | enum(see examples) | Type of red card.                                    | _null_,_“StraightRed”_, |
|          |          |                    |                                                      | _“SecondYellow”_        |

## Amend Shot Action

Amend specific info

| Property | Required | Type               | Description          | Examples                 |
| -------- | -------- | ------------------ | -------------------- | ------------------------ |
| Clock    | yes      | Clock              | SeeClock             | _See object details_     |
| Outcome  | no       | enum(see examples) | Outcome of the shot. | _null_,_“OnTarget”_,     |
|          |          |                    |                      | _“OffTarget”_,           |
|          |          |                    |                      | _“Woodwork”_,_“Blocked”_ |

## Amend Substitution Action

Amend specific info

| Property    | Required | Type        | Description                                                    | Examples             |
| ----------- | -------- | ----------- | -------------------------------------------------------------- | -------------------- |
| Clock       | yes      | Clock       | SeeClock                                                       | _See object details_ |
| PlayerInId  | no       | number,null | External Id of the player that enters the feld, if applicable. | _null_,_3290005_,    |
|             |          |             |                                                                | _1290003_,_5020305_  |
| PlayerOutId | no       | number,null | External Id of the player that leaves the feld, if applicable. | _null_,_3290005_,    |
|             |          |             |                                                                | _1290003_,_5020305_  |

## Amend Throw In Action

Amend specific info

| Property    | Required | Type               | Description       | Examples                    |
| ----------- | -------- | ------------------ | ----------------- | --------------------------- |
| Clock       | yes      | Clock              | SeeClock          | _See object details_        |
| ThrowInType | no       | enum(see examples) | Type of Throw In. | _null_,_“Safe”_,_“Attack”_, |
|             |          |                    |                   | _“Danger”_                  |

## Amend VAR End Action

Amend specific info

| Property | Required | Type               | Description         | Examples             |
| -------- | -------- | ------------------ | ------------------- | -------------------- |
| Clock    | yes      | Clock              | SeeClock            | _See object details_ |
| Outcome  | no       | enum(see examples) | Outcome of the VAR. | _null_,_“Stands”_,   |
|          |          |                    |                     | _“Overturned”_       |

TXODDS

5

Scores Product API documentation

3 June 2026

## Amend Yellow Card Action

Amend specific info

| Property | Required | Type        | Description                                          | Examples             |
| -------- | -------- | ----------- | ---------------------------------------------------- | -------------------- |
| Clock    | yes      | Clock       | SeeClock                                             | _See object details_ |
| PlayerId | no       | number,null | External Id of the player that received the card, if | _null_,_3290005_,    |
|          |          |             | applicable.                                          | _1290003_,_5020305_  |

## Clock

Game clock

| Property | Required | Type    | Description                                                    | Examples                    |
| -------- | -------- | ------- | -------------------------------------------------------------- | --------------------------- |
| Running  | yes      | boolean | Is the clock currently running?.                               | _false_,_true_              |
| Seconds  | yes      | number  | Time in seconds left in the current period. At the start it is | _0_,_302_,_400_,_734_,_900_ |
|          |          |         | the full time for the period (for example, 45 minutes would    |                             |
|          |          |         | be 2700 seconds). The value decreases with every new           |                             |
|          |          |         | action until the end of the period.                            |                             |

## Kickoff Details

Kick-off information

| Property | Required | Type        | Description                                         | Examples       |
| -------- | -------- | ----------- | --------------------------------------------------- | -------------- |
| Team     | yes      | number,null | Team that does the kick-off. Referenced participant | _null_,_1_,_2_ |
|          |          |             | number (Participant1vsParticipant2). Home/away      |                |
|          |          |             | mapping is provided by theParticipant1IsHomefag on  |                |
|          |          |             | the fxture.                                         |                |

## Lineup Data

Lineup information for a team

| Property         | Required | Type                    | Description                                     | Examples             |
| ---------------- | -------- | ----------------------- | ----------------------------------------------- | -------------------- |
| entityStatus     | no       | string,null             | Team status.                                    | _See object details_ |
| entityVersion    | yes      | number                  | Team information version.                       | _0_,_5_,_8_          |
| gender           | yes      | enum(see examples)      | Information about the gender of the team (which | _“female”_,_“male”_  |
|                  |          |                         | gendered competitions it is playing in).        |                      |
| id               | yes      | string                  | Team UUID.                                      | _“227264fb-4132-_    |
|                  |          |                         |                                                 | _4e49-9121-_         |
|                  |          |                         |                                                 | _3165c753002e”_,     |
|                  |          |                         |                                                 | _“443653c4-32ae-_    |
|                  |          |                         |                                                 | _401e-b5ef-_         |
|                  |          |                         |                                                 | _97db6fa3ed86”_      |
| lineups          | yes      | Array<PlayerLineupData> | Player lineup information.                      | _See object details_ |
| normativeId      | yes      | number                  | Team normative Id.                              | _4268_,_4707_        |
| preferredName    | yes      | string                  | Team name.                                      | _“Real Madrid”_,     |
|                  |          |                         |                                                 | _“Barcelona”_        |
| sportId          | yes      | string                  | Sport Id.                                       | _“00000000-0000-_    |
|                  |          |                         |                                                 | _0006-0000-_         |
|                  |          |                         |                                                 | _000000000003”_,     |
|                  |          |                         |                                                 | _“00000000-0000-_    |
|                  |          |                         |                                                 | _0006-0000-_         |
|                  |          |                         |                                                 | _000000000004”_      |
| updateDateMillis | yes      | number                  | Team update timestamp.                          | _1732878222979_,     |
|                  |          |                         |                                                 | _1732878726834_      |

6

TXODDS

Scores Product API documentation

3 June 2026

## Participant State

Information about a team during this game

| Property                      | Required | Type               | Description                                             | Examples                     |
| ----------------------------- | -------- | ------------------ | ------------------------------------------------------- | ---------------------------- |
| PossibleEvent                 | no       | PossiblePartyEvent | Possible events in the game for this team. See          | _See object details_         |
|                               |          |                    | PossiblePartyEvent                                      |                              |
| Player Data                   |          |                    |                                                         |                              |
| Data about a player in a team |          |                    |                                                         |                              |
| Property                      | Required | Type               | Description                                             | Examples                     |
| country                       | no       | string,null        | Player country of origin.                               | _null_,_“Dominican_          |
|                               |          |                    |                                                         | _Republic”_,_“England”_,     |
|                               |          |                    |                                                         | _“Spain”_,_“USA”_            |
| dateOfBirth                   | no       | string,null        | Player date of birth.                                   | _null_,_“1987−02−20”_,       |
|                               |          |                    |                                                         | _“1999−12−03”_,              |
|                               |          |                    |                                                         | _“2003−06−11”_               |
| entityStatus                  | no       | string,null        | Player status.                                          | _See object details_         |
| entityVersion                 | yes      | number             | Player information version.                             | _0_,_5_,_8_                  |
| gender                        | yes      | enum(see examples) | Gender of the player.                                   | _“female”_,_“male”_          |
| id                            | yes      | string             | Player UUID.                                            | _“227264fb-4132-_            |
|                               |          |                    |                                                         | _4e49-9121-_                 |
|                               |          |                    |                                                         | _3165c753002e”_,             |
|                               |          |                    |                                                         | _“443653c4-32ae-_            |
|                               |          |                    |                                                         | _401e-b5ef-_                 |
|                               |          |                    |                                                         | _97db6fa3ed86”_              |
| normativeId                   | yes      | number             | Player normative Id.                                    | _1752_,_4268_,_4707_         |
| preferredName                 | yes      | string             | Player name (Last Name, First Name) in normalised Latin | _“Baker, Brandon”_,          |
|                               |          |                    | chars.                                                  | _“Gallian, John”_,_“Kornet,_ |
|                               |          |                    |                                                         | _Luke”_                      |
| sportId                       | yes      | string             | Sport Id.                                               | _“00000000-0000-_            |
|                               |          |                    |                                                         | _0006-0000-_                 |
|                               |          |                    |                                                         | _000000000003”_,             |
|                               |          |                    |                                                         | _“00000000-0000-_            |
|                               |          |                    |                                                         | _0006-0000-_                 |
|                               |          |                    |                                                         | _000000000004”_              |
| team                          | no       | string,null        | Player team Id.                                         | _null_,_“00000000-0000-_     |
|                               |          |                    |                                                         | _0006-0000-_                 |
|                               |          |                    |                                                         | _000000000003”_,             |
|                               |          |                    |                                                         | _“00000000-0000-_            |
|                               |          |                    |                                                         | _0006-0000-_                 |
|                               |          |                    |                                                         | _000000000004”_              |
| updateDateMillis              | yes      | number             | Player update timestamp.                                | _1732878222979_,             |
|                               |          |                    |                                                         | _1732878726834_              |

## Player Lineup Data

Lineup information for a team

| Property       | Required | Type        | Description                                            | Examples                          |
| -------------- | -------- | ----------- | ------------------------------------------------------ | --------------------------------- |
| fxturePlayerId | no       | number      | Player Id in the fxture, used to reference a player in | _1187_,_1975_,_5629_              |
|                |          |             | events.                                                |                                   |
| player         | no       | PlayerData  | Player information. SeePlayerData                      | _See object details_              |
| positionId     | yes      | number      | Position Id in the fxture.                             | _11_,_34_,_37_                    |
| rosterNumber   | no       | string,null | Roster number.                                         | _null_,_“0”_,_“00”_,_“09”_,_“9”_, |
|                |          |             |                                                        | _“18”_                            |
| starter        | no       | boolean     | The player is part of the starting team.               | _true_,_false_                    |
| statusId       | yes      | number      | Player Status.                                         | _3_,_7_                           |
| unitId         | yes      | number      | Unit Id.                                               | _2_,_5_                           |

TXODDS

7

Scores Product API documentation

3 June 2026

Examples

Property Required Type Description

## Player on pitch flag

Numeric value. It is 1 if the corresponding player is on the pitch, -1 if they are not

## Player Statistics

Player statistics for both participants

| Property     | Required | Type         | Description                                                 | Examples             |
| ------------ | -------- | ------------ | ----------------------------------------------------------- | -------------------- |
| Participant1 | yes      | Map<number,  | Player statistics for the referenced player. SeePlayerStats | _See object details_ |
|              |          | PlayerStats> |                                                             |                      |
| Participant2 | yes      | Map<number,  | Player statistics for the referenced player. SeePlayerStats | _See object details_ |
|              |          | PlayerStats> |                                                             |                      |

## Player Statistics

Player statistics, usually indexed by the player id

| Property        | Required | Type   | Description            | Examples        |
| --------------- | -------- | ------ | ---------------------- | --------------- |
| goals           | yes      | number | Goals scored.          | _0_,_1_,_3_,_5_ |
| ownGoals        | yes      | number | Own goals scored.      | _0_,_1_,_3_,_5_ |
| penaltyAttempts | yes      | number | Penalties taken.       | _0_,_1_,_3_,_5_ |
| penaltyGoals    | yes      | number | Penalties scored.      | _0_,_1_,_3_,_5_ |
| redCards        | yes      | number | Red cards received.    | _0_,_1_,_2_     |
| shots           | yes      | number | Shots attempted.       | _0_,_1_,_3_,_5_ |
| yellowCards     | yes      | number | Yellow cards received. | _0_,_1_,_2_     |

## Players on Pitch

Players on pitch for both participants

| Property     | Required | Type               | Description                                     | Examples             |
| ------------ | -------- | ------------------ | ----------------------------------------------- | -------------------- |
| Participant1 | yes      | Map<number,        | Flag is 1 if player is on pitch, -1 if not. See | _See object details_ |
|              |          | PlayerOnPitchFlag> | PlayerOnPitchFlag                               |                      |
| Participant2 | yes      | Map<number,        | Flag is 1 if player is on pitch, -1 if not. See | _See object details_ |
|              |          | PlayerOnPitchFlag> | PlayerOnPitchFlag                               |                      |

## PossibleNeutralEvent

Possible game event

| Property   | Required | Type    | Description                     | Examples       |
| ---------- | -------- | ------- | ------------------------------- | -------------- |
| RedCard    | yes      | boolean | A possible red card in play.    | _false_,_true_ |
| VAR        | yes      | boolean | A possible VAR review in play.  | _false_,_true_ |
| YellowCard | yes      | boolean | A possible yellow card in play. | _false_,_true_ |

## PossiblePartyEvent

Possible event for a participant

8

TXODDS

Scores Product API documentation

3 June 2026

| Property | Required | Type    | Description         | Examples       |
| -------- | -------- | ------- | ------------------- | -------------- |
| Corner   | yes      | boolean | A possible corner.  | _false_,_true_ |
| Goal     | yes      | boolean | A possible goal.    | _false_,_true_ |
| Penalty  | yes      | boolean | A possible penalty. | _false_,_true_ |

## Score

Score information, referencing the current score of the game, not the change caused by this action. Score is provided in actions that can modify the score-line

| Property     | Required | Type             | Description                                            | Examples             |
| ------------ | -------- | ---------------- | ------------------------------------------------------ | -------------------- |
| Participant1 | yes      | ScoreParticipant | Score for participant 1. Home/away mapping is provided | _See object details_ |
|              |          |                  | by theParticipant1IsHomefag on the fxture. See         |                      |
|              |          |                  | ScoreParticipant                                       |                      |
| Participant2 | yes      | ScoreParticipant | Score for participant 2. Home/away mapping is provided | _See object details_ |
|              |          |                  | by theParticipant1IsHomefag on the fxture. See         |                      |
|              |          |                  | ScoreParticipant                                       |                      |

## Score for Participant in Period

Score information for a participant

| Property | Required | Type                   | Description                                                 | Examples             |
| -------- | -------- | ---------------------- | ----------------------------------------------------------- | -------------------- |
| ET1      | no       | ScoreParticipantPeriod | Score on 1st half of extra time. See                        | _See object details_ |
|          |          |                        | ScoreParticipantPeriod                                      |                      |
| ET2      | no       | ScoreParticipantPeriod | Score on 2nd half of extra time. See                        | _See object details_ |
|          |          |                        | ScoreParticipantPeriod                                      |                      |
| ETTotal  | no       | ScoreParticipantPeriod | Total extra time score: the sum of scores in all extra time | _See object details_ |
|          |          |                        | periods. SeeScoreParticipantPeriod                          |                      |
| H1       | no       | ScoreParticipantPeriod | Score on 1st half. SeeScoreParticipantPeriod                | _See object details_ |
| H2       | no       | ScoreParticipantPeriod | Score on 2nd half. SeeScoreParticipantPeriod                | _See object details_ |
| HT       | no       | ScoreParticipantPeriod | Score up to halftime. SeeScoreParticipantPeriod             | _See object details_ |
| PE       | no       | ScoreParticipantPeriod | Score on penalties. SeeScoreParticipantPeriod               | _See object details_ |
| Total    | no       | ScoreParticipantPeriod | Total score: sum of all periods and extra time periods. See | _See object details_ |
|          |          |                        | ScoreParticipantPeriod                                      |                      |

## Score for Participant in Period

Score information for a participant in a given period

| Property    | Required | Type   | Description                  | Examples         |
| ----------- | -------- | ------ | ---------------------------- | ---------------- |
| Corners     | yes      | number | Total corners taken.         | _0_,_1_,_4_,_12_ |
| Goals       | yes      | number | Total goals scored.          | _0_,_1_,_3_,_5_  |
| RedCards    | yes      | number | Total red cards received.    | _0_,_1_,_2_,_3_  |
| YellowCards | yes      | number | Total yellow cards received. | _0_,_2_,_3_,_5_  |

## Action messages

The following sections describe the format of all Fixture Actions. Each message represent one action in the game.

Fields that indicate game status, like Score, will appear if the action modifies the value. If it does not, the value may not be returned, for brevity.

TXODDS

9

Scores Product API documentation

3 June 2026

## Action Amend

Amends an action that was previously sent. The Id field should match the Id of the action to amend. The Action name should match (same action type). Previous is the previous payload sent for the action, so they payload can vary depending on the action being amended. New contains the new values for that action, to replace the previous one. The fields amended are usually fields like PlayerId or Timestamp, that shouldn’t have an impact on the game state itself (no changes to score, etc). Important note: the status id associated to this action will match the status id of the action being amended. For example, an amend during Q2 of an action that happened in Q1, will display Q1 in the status id. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type                                                                       | Description                                                 | Examples                   |
| -------------- | -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------- |
| Action         | yes      | enum(see examples)                                                         | Action Type.                                                | _“action_amend”_           |
| Clock          | yes      | Clock                                                                      | Game clock. SeeClock                                        | _See object details_       |
| ConnectionId   | yes      | number                                                                     | Internal ID of the connection.                              | _12_,_13_,_9_,_1_,_18_     |
| Data           | yes      | object                                                                     | Action specifc info.                                        | _See object details_       |
| Data.Action    | yes      | string                                                                     | Name of the action to amend. It has to match a previously   | _See object details_       |
|                |          |                                                                            | sent action.                                                |                            |
| Data.Id        | yes      | number                                                                     | Id of the action to amend. It has to match a previously     | _18_,_68_,_87_,_10_,_69_   |
|                |          |                                                                            | sent action.                                                |                            |
| Data.New       | yes      | SoccerThrowInor                                                            | New values for the action. The contents will be the same    | _See object details_       |
|                |          | SoccerFreeKickor                                                           | as theDatafeld for the action amended. It will also         |                            |
|                |          | SoccerShotor                                                               | embed theClockvalue of the updated action message.          |                            |
|                |          | SoccerGoalor                                                               |                                                             |                            |
|                |          | SoccerPenaltyOutcome                                                       |                                                             |                            |
|                |          | orSoccerYellowCardor                                                       |                                                             |                            |
|                |          | SoccerRedCardor                                                            |                                                             |                            |
|                |          | SoccerVAREndor                                                             |                                                             |                            |
|                |          | SoccerAdditionalTime                                                       |                                                             |                            |
|                |          | orSoccerSubstitution                                                       |                                                             |                            |
| Data.Previous  | yes      | SoccerThrowInor                                                            | Old values for the action. The contents will be the same    | _See object details_       |
|                |          | SoccerFreeKickor                                                           | as theDatafeld for the action amended. It will also         |                            |
|                |          | SoccerShotor                                                               | embed theClockvalue of the previous action message.         |                            |
|                |          | SoccerGoalor                                                               |                                                             |                            |
|                |          | SoccerPenaltyOutcome                                                       |                                                             |                            |
|                |          | orSoccerYellowCardor                                                       |                                                             |                            |
|                |          | SoccerRedCardor                                                            |                                                             |                            |
|                |          | SoccerVAREndor                                                             |                                                             |                            |
|                |          | SoccerAdditionalTime                                                       |                                                             |                            |
|                |          | orSoccerSubstitution                                                       |                                                             |                            |
| FixtureId      | yes      | number                                                                     | The normative Id of the fxture.                             | _10461989_,_10190463_,     |
|                |          |                                                                            |                                                             | _10260031_,_10026403_,     |
|                |          |                                                                            |                                                             | _10471436_                 |
| FollowsAction  | no       | number                                                                     | Action ID of a previous action that originated this action. | _35_,_17_,_56_,_67_,_98_   |
|                |          |                                                                            | It is used to indicate actions that may need to be          |                            |
|                |          |                                                                            | discarded as a unit.                                        |                            |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the       | _36_,_18_,_57_,_68_,_99_   |
|                |          |                                                                            | same action ID. For example, an unconfrmed action           |                            |
|                |          |                                                                            | followed by a confrmation.                                  |                            |
| Participant    | no       | number,null                                                                | The team related to the original action being amended.      | _null_,_1_,_2_             |
|                |          |                                                                            | Home/away mapping is provided by the                        |                            |
|                |          |                                                                            | Participant1IsHome fag on the fxture.                       |                            |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                             | _See object details_       |
| Possession     | no       | number                                                                     | Participant that has the ball. Home/away mapping is         | _1_,_2_                    |
|                |          |                                                                            | provided by theParticipant1IsHomefag on the fxture.         |                            |
| PossessionType | no       | enum(see examples)                                                         | The danger associated to the current possession.            | _null_,_“SafePossession”_, |
|                |          |                                                                            |                                                             | _“AttackPossession”_,      |
|                |          |                                                                            |                                                             | _“DangerPossession”_,      |
|                |          |                                                                            |                                                             | _“HighDangerPossession”_   |
| Score          | no       | Score                                                                      | Score information, referencing the current score of the     | _See object details_       |
|                |          |                                                                            | game, not the change caused by this action. Score is        |                            |
|                |          |                                                                            | provided in actions that can modify the score-line. See     |                            |
|                |          |                                                                            | Score                                                       |                            |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                        | _52_,_60_,_74_,_40_,_48_   |
| StatusId       | yes      | number                                                                     | The ID for the current game period. SeeStatusId.            | _2_,_4_,_7_,_9_,_12_       |

10

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples              |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------- |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,      |
|                |          |                    |                                                                | _1732878371314_,      |
|                |          |                    |                                                                | _1732878438368_,      |
|                |          |                    |                                                                | _1732878219489_,      |
|                |          |                    |                                                                | _1732879081689_       |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_            |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |                    | of an existing fxture for test purposes.                       |                       |

## Action Discarded

Discards previously added action. The action discarded is the action whose Id matches the Id field provided. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type                                                                       | Description                                                    | Examples                   |
| -------------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------- |
| Action         | yes      | enum(see examples)                                                         | Action type.                                                   | _“action_discarded”_       |
| Clock          | no       | Clock                                                                      | Game clock. SeeClock                                           | _See object details_       |
| ConnectionId   | yes      | number                                                                     | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_     |
| FixtureId      | yes      | number                                                                     | The normative Id of the fxture.                                | _10461989_,_10190463_,     |
|                |          |                                                                            |                                                                | _10260031_,_10026403_,     |
|                |          |                                                                            |                                                                | _10471436_                 |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_   |
|                |          |                                                                            | same action ID. For example, an unconfrmed action              |                            |
|                |          |                                                                            | followed by a confrmation.                                     |                            |
| Parti1State    | yes      | PartiState                                                                 | State for theParticipant1. Home/away mapping is                | _See object details_       |
|                |          |                                                                            | provided by theParticipant1IsHomefag on the fxture.            |                            |
|                |          |                                                                            | SeePartiState                                                  |                            |
| Parti2State    | yes      | PartiState                                                                 | State for theParticipant2. Home/away mapping is                | _See object details_       |
|                |          |                                                                            | provided by theParticipant1IsHomefag on the fxture.            |                            |
|                |          |                                                                            | SeePartiState                                                  |                            |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                                | _See object details_       |
| Possession     | yes      | number                                                                     | Participant that has the ball. Home/away mapping is            | _1_,_2_                    |
|                |          |                                                                            | provided by theParticipant1IsHomefag on the fxture.            |                            |
| PossessionType | no       | enum(see examples)                                                         | The danger associated to the current possession.               | _null_,_“SafePossession”_, |
|                |          |                                                                            |                                                                | _“AttackPossession”_,      |
|                |          |                                                                            |                                                                | _“DangerPossession”_,      |
|                |          |                                                                            |                                                                | _“HighDangerPossession”_   |
| PossibleEvent  | no       | PossibleNeutralEvent                                                       | Possible events active in the game. They affect both           | _See object details_       |
|                |          |                                                                            | teams. SeePossibleNeutralEvent                                 |                            |
| Score          | yes      | Score                                                                      | Score information, referencing the current score of the        | _See object details_       |
|                |          |                                                                            | game, not the change caused by this action. Score is           |                            |
|                |          |                                                                            | provided in actions that can modify the score-line. See        |                            |
|                |          |                                                                            | Score                                                          |                            |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_   |
| Ts             | yes      | number                                                                     | Timestamp of the update.                                       | _1732878668797_,           |
|                |          |                                                                            |                                                                | _1732878371314_,           |
|                |          |                                                                            |                                                                | _1732878438368_,           |
|                |          |                                                                            |                                                                | _1732878219489_,           |
|                |          |                                                                            |                                                                | _1732879081689_            |
| Type           | no       | enum(see examples)                                                         | Sport Type.                                                    | _“Soccer”_                 |
| VirtualFixture | no       | null,boolean                                                               | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_      |
|                |          |                                                                            | of an existing fxture for test purposes.                       |                            |

## Additional Time

Indicates how much additional time is added to the current period, at the end of the regular minutes allocated for the period. This action _can be followed up with updates_ - new messages with the same action id can update this action.

TXODDS

11

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“additional_time”_      |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_     |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                |          |                    | sent with the same action ID, and potentially more             |                          |
|                |          |                    | information related to the action. An unconfrmed event is      |                          |
|                |          |                    | closer in time to the event happening, as confrmation          |                          |
|                |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                |          |                    | when handling the events.                                      |                          |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data           | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.Minutes   | no       | number,null        | Minutes added to the current period.                           | _null_,_1_,_3_,_10_      |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_          |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Attack Possession

The participant has the ball in the attacking area. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type               | Description                                           | Examples                 |
| -------------- | -------- | ------------------ | ----------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                          | _“attack_possession”_    |
| Clock          | yes      | Clock              | Game clock. SeeClock                                  | _See object details_     |
| ConnectionId   | yes      | number             | Internal ID of the connection.                        | _12_,_13_,_9_,_1_,_18_   |
| FixtureId      | yes      | number             | The normative Id of the fxture.                       | _10461989_,_10190463_,   |
|                |          |                    |                                                       | _10260031_,_10026403_,   |
|                |          |                    |                                                       | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action     |                          |
|                |          |                    | followed by a confrmation.                            |                          |
| Participant    | yes      | number             | The team that has possession of the ball.             | _1_,_2_                  |
| Possession     | no       | number             | Participant that has the ball. Home/away mapping is   | _1_,_2_                  |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.   |                          |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.      | _“SafePossession”_,      |
|                |          |                    |                                                       | _“AttackPossession”_,    |
|                |          |                    |                                                       | _“DangerPossession”_,    |
|                |          |                    |                                                       | _“HighDangerPossession”_ |
| Seq            | yes      | number             | Update sequence number for a fxture.                  | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.      | _11_,_1_,_5_,_6_,_2_     |
| Ts             | yes      | number             | Timestamp of the update.                              | _1732878668797_,         |
|                |          |                    |                                                       | _1732878371314_,         |
|                |          |                    |                                                       | _1732878438368_,         |
|                |          |                    |                                                       | _1732878219489_,         |
|                |          |                    |                                                       | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                           | _“Soccer”_               |

12

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type         | Description                                                    | Examples              |
| -------------- | -------- | ------------ | -------------------------------------------------------------- | --------------------- |
| VirtualFixture | no       | null,boolean | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |              | of an existing fxture for test purposes.                       |                       |

## Clock Adjustment

Amends the clock value with corrected seconds and whether it is running or not. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“clock_adjustment”_     |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_     |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data           | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.Clock     | no       | Clock              | The clock value to use. SeeClock                               | _See object details_     |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| FollowsAction  | no       | number             | Action ID of a previous action that originated this action.    | _35_,_17_,_56_,_67_,_98_ |
|                |          |                    | It is used to indicate actions that may need to be             |                          |
|                |          |                    | discarded as a unit.                                           |                          |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Comment

A message sent by the reporter. Contains pre-made messages or custom text. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property      | Required | Type               | Description                                                  | Examples                     |
| ------------- | -------- | ------------------ | ------------------------------------------------------------ | ---------------------------- |
| Action        | yes      | enum(see examples) | Action Type.                                                 | _“comment”_                  |
| ConnectionId  | yes      | number             | Internal ID of the connection.                               | _12_,_13_,_9_,_1_,_18_       |
| Data          | yes      | object             | Action specifc info.                                         | _See object details_         |
| Data.Active   | no       | boolean,null       | If true, the current message information is still valid. If  | _null_,_false_,_true_        |
|               |          |                    | false, the message is no longer valid and should be          |                              |
|               |          |                    | ignored.                                                     |                              |
| Data.Severity | no       | enum(see examples) | Indicates how important is the comment. An                   | _null_,_“info”_,_“warning”_, |
|               |          |                    | action_invalidcomment means a previous action has            | _“action_invalid”_           |
|               |          |                    | been discarded, but that action was too far in the past,     |                              |
|               |          |                    | and the state (scores) have not been adjusted. It is likely, |                              |
|               |          |                    | although not mandatory, that a score adjustment may          |                              |
|               |          |                    | follow soon. Warnings are to be paid more attention than     |                              |
|               |          |                    | Info, as they may indicate issues with the game.             |                              |

TXODDS

13

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                    |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------------- |
| Data.Text      | no       | string,null        | The message sent. Usually one of the enum below, but           | _null_,_“Action has been_   |
|                |          |                    | could be free text in some cases.                              | _marked as invalid”_,       |
|                |          |                    |                                                                | _“The game stopped_         |
|                |          |                    |                                                                | _due to a serious injury”_, |
|                |          |                    |                                                                | _“The game start is_        |
|                |          |                    |                                                                | _delayed”_,_“The game_      |
|                |          |                    |                                                                | _interrupted”_,             |
|                |          |                    |                                                                | _“Water-drinking break”_,   |
|                |          |                    |                                                                | _“Home Team Coach_          |
|                |          |                    |                                                                | _Red Card”_,_“Away_         |
|                |          |                    |                                                                | _Team Coach Red Card”_      |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,      |
|                |          |                    |                                                                | _10260031_,_10026403_,      |
|                |          |                    |                                                                | _10471436_                  |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_    |
|                |          |                    | same action ID. For example, an unconfrmed action              |                             |
|                |          |                    | followed by a confrmation.                                     |                             |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_    |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,            |
|                |          |                    |                                                                | _1732878371314_,            |
|                |          |                    |                                                                | _1732878438368_,            |
|                |          |                    |                                                                | _1732878219489_,            |
|                |          |                    |                                                                | _1732879081689_             |
| Type           | no       | enum(see examples) | Sport Type.                                                    | _“Soccer”_                  |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_       |
|                |          |                    | of an existing fxture for test purposes.                       |                             |

## Connected

A connection has been established. The field ConnectionType identifies the type of user that connected.

| Property           | Required | Type               | Description                                                    | Examples                 |
| ------------------ | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action             | yes      | enum(see examples) | Action Type.                                                   | _“connected”_            |
| Confrmed           | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                    |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                    |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                    |          |                    | sent with the same action ID, and potentially more             |                          |
|                    |          |                    | information related to the action. An unconfrmed event is      |                          |
|                    |          |                    | closer in time to the event happening, as confrmation          |                          |
|                    |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                    |          |                    | when handling the events.                                      |                          |
| ConnectionId       | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| ConnectionServerId | yes      | string             | Internal Id of the server .                                    | _“507ad907-9f35-458f-_   |
|                    |          |                    |                                                                | _8a7b-982c62ce5292”_,    |
|                    |          |                    |                                                                | _“44a5ecab-49b5-_        |
|                    |          |                    |                                                                | _4b21-8712-_             |
|                    |          |                    |                                                                | _e27cfc69bb96”_          |
| ConnectionType     | yes      | enum(see examples) | The type of user that established the connection.              | _“reporter”_,_“analyst”_ |
| FixtureId          | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                    |          |                    |                                                                | _10260031_,_10026403_,   |
|                    |          |                    |                                                                | _10471436_               |
| Id                 | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                    |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                    |          |                    | followed by a confrmation.                                     |                          |
| Seq                | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| Ts                 | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                    |          |                    |                                                                | _1732878371314_,         |
|                    |          |                    |                                                                | _1732878438368_,         |
|                    |          |                    |                                                                | _1732878219489_,         |
|                    |          |                    |                                                                | _1732879081689_          |
| Type               | no       | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture     | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                    |          |                    | of an existing fxture for test purposes.                       |                          |

TXODDS

14

Scores Product API documentation

3 June 2026

## Corner

Indicates a Corner taking place. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property       | Required | Type               | Description                                                    | Examples                   |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | -------------------------- |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“corner”_                 |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_       |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_             |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                            |
|                |          |                    | however the fnal confrmation is still pending and will be      |                            |
|                |          |                    | sent with the same action ID, and potentially more             |                            |
|                |          |                    | information related to the action. An unconfrmed event is      |                            |
|                |          |                    | closer in time to the event happening, as confrmation          |                            |
|                |          |                    | could be delayed by events on feld. Take this in account       |                            |
|                |          |                    | when handling the events.                                      |                            |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_     |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,     |
|                |          |                    |                                                                | _10260031_,_10026403_,     |
|                |          |                    |                                                                | _10471436_                 |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_   |
|                |          |                    | same action ID. For example, an unconfrmed action              |                            |
|                |          |                    | followed by a confrmation.                                     |                            |
| Participant    | yes      | number             | The team that takes the corner.                                | _1_,_2_                    |
| Possession     | no       | number             | Participant that has the ball. Home/away mapping is            | _1_,_2_                    |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.            |                            |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.               | _null_,_“SafePossession”_, |
|                |          |                    |                                                                | _“AttackPossession”_,      |
|                |          |                    |                                                                | _“DangerPossession”_,      |
|                |          |                    |                                                                | _“HighDangerPossession”_   |
| Score          | no       | Score              | Score information, referencing the current score of the        | _See object details_       |
|                |          |                    | game, not the change caused by this action. Score is           |                            |
|                |          |                    | provided in actions that can modify the score-line. See        |                            |
|                |          |                    | Score                                                          |                            |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_   |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_       |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,           |
|                |          |                    |                                                                | _1732878371314_,           |
|                |          |                    |                                                                | _1732878438368_,           |
|                |          |                    |                                                                | _1732878219489_,           |
|                |          |                    |                                                                | _1732879081689_            |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                 |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_      |
|                |          |                    | of an existing fxture for test purposes.                       |                            |

## Danger Possession

The participant has the ball in the attack and is creating danger for the opposition. Scoring is possible. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property     | Required | Type               | Description                                           | Examples                 |
| ------------ | -------- | ------------------ | ----------------------------------------------------- | ------------------------ |
| Action       | yes      | enum(see examples) | Action Type.                                          | _“danger_possession”_    |
| Clock        | yes      | Clock              | Game clock. SeeClock                                  | _See object details_     |
| ConnectionId | yes      | number             | Internal ID of the connection.                        | _12_,_13_,_9_,_1_,_18_   |
| FixtureId    | yes      | number             | The normative Id of the fxture.                       | _10461989_,_10190463_,   |
|              |          |                    |                                                       | _10260031_,_10026403_,   |
|              |          |                    |                                                       | _10471436_               |
| Id           | yes      | number             | Action ID. Messages for the same action will have the | _36_,_18_,_57_,_68_,_99_ |
|              |          |                    | same action ID. For example, an unconfrmed action     |                          |
|              |          |                    | followed by a confrmation.                            |                          |
| Participant  | yes      | number             | The team that has possession of the ball.             | _1_,_2_                  |
| Possession   | no       | number             | Participant that has the ball. Home/away mapping is   | _1_,_2_                  |
|              |          |                    | provided by theParticipant1IsHomefag on the fxture.   |                          |

TXODDS

15

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.               | _“SafePossession”_,      |
|                |          |                    |                                                                | _“AttackPossession”_,    |
|                |          |                    |                                                                | _“DangerPossession”_,    |
|                |          |                    |                                                                | _“HighDangerPossession”_ |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_          |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Disconnected

A connection has been terminated. The field ConnectionType identifies the type of user that disconnected.

| Property           | Required | Type               | Description                                                    | Examples                 |
| ------------------ | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action             | yes      | enum(see examples) | Action Type.                                                   | _“disconnected”_         |
| Confrmed           | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                    |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                    |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                    |          |                    | sent with the same action ID, and potentially more             |                          |
|                    |          |                    | information related to the action. An unconfrmed event is      |                          |
|                    |          |                    | closer in time to the event happening, as confrmation          |                          |
|                    |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                    |          |                    | when handling the events.                                      |                          |
| ConnectionId       | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| ConnectionServerId | yes      | string             | Internal Id of the server.                                     | _“94c7697e-c3bf-4f7f-_   |
|                    |          |                    |                                                                | _b5f8-da865b067d3c”_,    |
|                    |          |                    |                                                                | _“d8414e0b-1a7a-_        |
|                    |          |                    |                                                                | _43b1-a3ff-_             |
|                    |          |                    |                                                                | _0b8d9d7c4d1b”_          |
| ConnectionType     | yes      | enum(see examples) | The type of user that closed the connection.                   | _“reporter”_,_“analyst”_ |
| FixtureId          | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                    |          |                    |                                                                | _10260031_,_10026403_,   |
|                    |          |                    |                                                                | _10471436_               |
| Id                 | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                    |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                    |          |                    | followed by a confrmation.                                     |                          |
| Seq                | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| Ts                 | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                    |          |                    |                                                                | _1732878371314_,         |
|                    |          |                    |                                                                | _1732878438368_,         |
|                    |          |                    |                                                                | _1732878219489_,         |
|                    |          |                    |                                                                | _1732879081689_          |
| Type               | no       | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture     | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                    |          |                    | of an existing fxture for test purposes.                       |                          |

## Free Kick

Indicates a Free Kick taking place. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property | Required | Type               | Description          | Examples             |
| -------- | -------- | ------------------ | -------------------- | -------------------- |
| Action   | yes      | enum(see examples) | Action Type.         | _“free_kick”_        |
| Clock    | yes      | Clock              | Game clock. SeeClock | _See object details_ |

16

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                    |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------------- |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_              |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                             |
|                |          |                    | however the fnal confrmation is still pending and will be      |                             |
|                |          |                    | sent with the same action ID, and potentially more             |                             |
|                |          |                    | information related to the action. An unconfrmed event is      |                             |
|                |          |                    | closer in time to the event happening, as confrmation          |                             |
|                |          |                    | could be delayed by events on feld. Take this in account       |                             |
|                |          |                    | when handling the events.                                      |                             |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_      |
| Data           | yes      | object             | Action specifc info.                                           | _See object details_        |
| Data.          | no       | enum(see examples) | The danger zone associated to the free kick.                   | _null_,_“Safe”_,_“Attack”_, |
| FreeKickType   |          |                    |                                                                | _“Danger”_,                 |
|                |          |                    |                                                                | _“HighDanger”_,             |
|                |          |                    |                                                                | _“Offside”_                 |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,      |
|                |          |                    |                                                                | _10260031_,_10026403_,      |
|                |          |                    |                                                                | _10471436_                  |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_    |
|                |          |                    | same action ID. For example, an unconfrmed action              |                             |
|                |          |                    | followed by a confrmation.                                     |                             |
| Participant    | yes      | number             | The team that takes the free kick.                             | _1_,_2_                     |
| Possession     | no       | number             | Participant that has the ball. Home/away mapping is            | _1_,_2_                     |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.            |                             |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.               | _null_,_“SafePossession”_,  |
|                |          |                    |                                                                | _“AttackPossession”_,       |
|                |          |                    |                                                                | _“DangerPossession”_,       |
|                |          |                    |                                                                | _“HighDangerPossession”_    |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_    |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_        |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,            |
|                |          |                    |                                                                | _1732878371314_,            |
|                |          |                    |                                                                | _1732878438368_,            |
|                |          |                    |                                                                | _1732878219489_,            |
|                |          |                    |                                                                | _1732879081689_             |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                  |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_       |
|                |          |                    | of an existing fxture for test purposes.                       |                             |

## Goal

Indicates a Goal. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property      | Required | Type               | Description                                               | Examples                  |
| ------------- | -------- | ------------------ | --------------------------------------------------------- | ------------------------- |
| Action        | yes      | enum(see examples) | Action Type.                                              | _“goal”_                  |
| Clock         | yes      | Clock              | Game clock. SeeClock                                      | _See object details_      |
| Confrmed      | yes      | boolean            | Action confrmation status. This indicates an action that  | _false_,_true_            |
|               |          |                    | actually happened, as opposed to_possible_actions,        |                           |
|               |          |                    | however the fnal confrmation is still pending and will be |                           |
|               |          |                    | sent with the same action ID, and potentially more        |                           |
|               |          |                    | information related to the action. An unconfrmed event is |                           |
|               |          |                    | closer in time to the event happening, as confrmation     |                           |
|               |          |                    | could be delayed by events on feld. Take this in account  |                           |
|               |          |                    | when handling the events.                                 |                           |
| ConnectionId  | yes      | number             | Internal ID of the connection.                            | _12_,_13_,_9_,_1_,_18_    |
| Data          | yes      | object             | Action specifc info.                                      | _See object details_      |
| Data.GoalType | no       | enum(see examples) | The type of goal.                                         | _null_,_“Shot”_,_“Head”_, |
|               |          |                    |                                                           | _“Own”_,_“Other”_         |
| Data.PlayerId | no       | number,null        | External Id of the player that scored, if applicable.     | _null_,_1004569_,         |
|               |          |                    |                                                           | _3240098_,_8891242_       |
| FixtureId     | yes      | number             | The normative Id of the fxture.                           | _10461989_,_10190463_,    |
|               |          |                    |                                                           | _10260031_,_10026403_,    |
|               |          |                    |                                                           | _10471436_                |

TXODDS

17

Scores Product API documentation

3 June 2026

| Property       | Required | Type                                                                       | Description                                                    | Examples                 |
| -------------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                                                                            | same action ID. For example, an unconfrmed action              |                          |
|                |          |                                                                            | followed by a confrmation.                                     |                          |
| Kickoff        | no       | KickoffDetails                                                             | Kick-off information. SeeKickoffDetails                        | _See object details_     |
| Participant    | yes      | number                                                                     | The team that scores the goal.                                 | _1_,_2_                  |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                                | _See object details_     |
| Score          | no       | Score                                                                      | Score information, referencing the current score of the        | _See object details_     |
|                |          |                                                                            | game, not the change caused by this action. Score is           |                          |
|                |          |                                                                            | provided in actions that can modify the score-line. See        |                          |
|                |          |                                                                            | Score                                                          |                          |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number                                                                     | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_          |
| Ts             | yes      | number                                                                     | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                                                                            |                                                                | _1732878371314_,         |
|                |          |                                                                            |                                                                | _1732878438368_,         |
|                |          |                                                                            |                                                                | _1732878219489_,         |
|                |          |                                                                            |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples)                                                         | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean                                                               | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                                                                            | of an existing fxture for test purposes.                       |                          |

## Goal Kick

A team does a goal-kick to start the play again. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type               | Description                                                    | Examples                   |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | -------------------------- |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“goal_kick”_              |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_       |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_     |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,     |
|                |          |                    |                                                                | _10260031_,_10026403_,     |
|                |          |                    |                                                                | _10471436_                 |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_   |
|                |          |                    | same action ID. For example, an unconfrmed action              |                            |
|                |          |                    | followed by a confrmation.                                     |                            |
| Participant    | yes      | number             | The team that does the goal kick.                              | _1_,_2_                    |
| Possession     | no       | number             | Participant that has the ball. Home/away mapping is            | _1_,_2_                    |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.            |                            |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.               | _null_,_“SafePossession”_, |
|                |          |                    |                                                                | _“AttackPossession”_,      |
|                |          |                    |                                                                | _“DangerPossession”_,      |
|                |          |                    |                                                                | _“HighDangerPossession”_   |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_   |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_       |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,           |
|                |          |                    |                                                                | _1732878371314_,           |
|                |          |                    |                                                                | _1732878438368_,           |
|                |          |                    |                                                                | _1732878219489_,           |
|                |          |                    |                                                                | _1732879081689_            |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                 |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_      |
|                |          |                    | of an existing fxture for test purposes.                       |                            |

## halftime_finalised

Halftime data finalised. Sent by the Analyst/Supervisor once halftime data has been reviewed and verified, indicating that halftime markets can be safely settled. The action may be sent multiple times for the same halftime period.

18

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type                                                                             | Description                                                    | Examples                 |
| -------------- | -------- | -------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples)                                                               | Action Type.                                                   | _“halftime_fnalised”_    |
| ConnectionId   | yes      | number                                                                           | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| FixtureId      | yes      | number                                                                           | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                                                                                  |                                                                | _10260031_,_10026403_,   |
|                |          |                                                                                  |                                                                | _10471436_               |
| Id             | yes      | number                                                                           | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                                                                                  | same action ID. For example, an unconfrmed action              |                          |
|                |          |                                                                                  | followed by a confrmation.                                     |                          |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics at the moment halftime was fnalised. |                                                                | _See object details_     |
|                |          |                                                                                  | SeePlayerStatsForParticipants                                  |                          |
| Score          | no       | Score                                                                            | Score information, referencing the current score of the        | _See object details_     |
|                |          |                                                                                  | game at the moment halftime was fnalised. SeeScore             |                          |
| Seq            | yes      | number                                                                           | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number                                                                           | Fixture status at the moment halftime was fnalised. See        | _3_,_8_                  |
|                |          |                                                                                  | StatusId.                                                      |                          |
| Ts             | yes      | number                                                                           | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                                                                                  |                                                                | _1732878371314_,         |
|                |          |                                                                                  |                                                                | _1732878438368_,         |
|                |          |                                                                                  |                                                                | _1732878219489_,         |
|                |          |                                                                                  |                                                                | _1732879081689_          |
| Type           | no       | enum(see examples)                                                               | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean                                                                     | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                                                                                  | of an existing fxture for test purposes.                       |                          |

## High Danger Possession

The participant has the ball in the attack and is creating chances. Scoring is likely. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type               | Description                                                    | Examples                   |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | -------------------------- |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“high_danger_possession”_ |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_       |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_     |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,     |
|                |          |                    |                                                                | _10260031_,_10026403_,     |
|                |          |                    |                                                                | _10471436_                 |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_   |
|                |          |                    | same action ID. For example, an unconfrmed action              |                            |
|                |          |                    | followed by a confrmation.                                     |                            |
| Participant    | yes      | number             | The team that has possession of the ball.                      | _1_,_2_                    |
| Possession     | no       | number             | Participant that has the ball. Home/away mapping is            | _1_,_2_                    |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.            |                            |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.               | _“SafePossession”_,        |
|                |          |                    |                                                                | _“AttackPossession”_,      |
|                |          |                    |                                                                | _“DangerPossession”_,      |
|                |          |                    |                                                                | _“HighDangerPossession”_   |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_   |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_       |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,           |
|                |          |                    |                                                                | _1732878371314_,           |
|                |          |                    |                                                                | _1732878438368_,           |
|                |          |                    |                                                                | _1732878219489_,           |
|                |          |                    |                                                                | _1732879081689_            |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                 |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_      |
|                |          |                    | of an existing fxture for test purposes.                       |                            |

## Injury

Reports a player injury situation for a team. This action _can be followed up with updates_ - new messages with the same action id can update this action.

TXODDS

19

Scores Product API documentation

3 June 2026

| Property         | Required | Type               | Description                                                    | Examples                 |
| ---------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action           | yes      | enum(see examples) | Action Type.                                                   | _“injury”_               |
| Clock            | yes      | Clock              | Game clock. SeeClock                                           | _See object details_     |
| Confrmed         | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                  |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                  |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                  |          |                    | sent with the same action ID, and potentially more             |                          |
|                  |          |                    | information related to the action. An unconfrmed event is      |                          |
|                  |          |                    | closer in time to the event happening, as confrmation          |                          |
|                  |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                  |          |                    | when handling the events.                                      |                          |
| ConnectionId     | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data             | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.Outcome     | no       | enum(see examples) | The outcome of the injury for the player, indicating if they   | _null_,_“OnPitch”_,      |
|                  |          |                    | can return to the game, or not.                                | _“OffPitch”_,            |
|                  |          |                    |                                                                | _“NotReturning”_         |
| Data.Participant | no       | number,null        | Team that suffers the injury.                                  | _null_,_1_,_2_           |
| Data.PlayerId    | no       | number,null        | External Id of the player that was injured. Can be             | _null_,_1290003_,        |
|                  |          |                    | modifed via action amend.                                      | _5020305_,_3290005_      |
| FixtureId        | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                  |          |                    |                                                                | _10260031_,_10026403_,   |
|                  |          |                    |                                                                | _10471436_               |
| Id               | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                  |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                  |          |                    | followed by a confrmation.                                     |                          |
| Seq              | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId         | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts               | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                  |          |                    |                                                                | _1732878371314_,         |
|                  |          |                    |                                                                | _1732878438368_,         |
|                  |          |                    |                                                                | _1732878219489_,         |
|                  |          |                    |                                                                | _1732879081689_          |
| Type             | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture   | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                  |          |                    | of an existing fxture for test purposes.                       |                          |

## Jersey

Color of a team jerseys for the given participant in this fixture. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property     | Required | Type               | Description                                           | Examples                     |
| ------------ | -------- | ------------------ | ----------------------------------------------------- | ---------------------------- |
| Action       | yes      | enum(see examples) | Action Type.                                          | _“jersey”_                   |
| Clock        | no       | Clock              | Game clock. SeeClock                                  | _See object details_         |
| ConnectionId | yes      | number             | Internal ID of the connection.                        | _12_,_13_,_9_,_1_,_18_       |
| Data         | yes      | object             | Action specifc info.                                  | _See object details_         |
| Data.Color   | no       | enum(see examples) | Color of the jersey for the team.                     | _null_,_“red”_,_“navyblue”_, |
|              |          |                    |                                                       | _“skyblue”_,_“green”_,       |
|              |          |                    |                                                       | _“white”_,_“black”_,         |
|              |          |                    |                                                       | _“yellow”_,_“orange”_,       |
|              |          |                    |                                                       | _“grey”_,_“burgundy”_,       |
|              |          |                    |                                                       | _“brown”_,_“purple”_,        |
|              |          |                    |                                                       | _“blue”_,_“olive”_,_“aqua”_, |
|              |          |                    |                                                       | _“gold”_                     |
| FixtureId    | yes      | number             | The normative Id of the fxture.                       | _10461989_,_10190463_,       |
|              |          |                    |                                                       | _10260031_,_10026403_,       |
|              |          |                    |                                                       | _10471436_                   |
| Id           | yes      | number             | Action ID. Messages for the same action will have the | _36_,_18_,_57_,_68_,_99_     |
|              |          |                    | same action ID. For example, an unconfrmed action     |                              |
|              |          |                    | followed by a confrmation.                            |                              |

20

TXODDS

Scores Product API documentation

3 June 2026

| Property                           | Required | Type                      | Description                                                    | Examples                   |
| ---------------------------------- | -------- | ------------------------- | -------------------------------------------------------------- | -------------------------- |
| Participant                        | yes      | number                    | Referenced participant number (Participant1vs                  | _1_,_2_                    |
|                                    |          |                           | Participant2). Home/away mapping is provided by the            |                            |
|                                    |          |                           | Participant1IsHomefag on the fxture.                           |                            |
| Seq                                | yes      | number                    | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_   |
| StatusId                           | no       | number                    | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_       |
| Ts                                 | yes      | number                    | Timestamp of the update.                                       | _1732878668797_,           |
|                                    |          |                           |                                                                | _1732878371314_,           |
|                                    |          |                           |                                                                | _1732878438368_,           |
|                                    |          |                           |                                                                | _1732878219489_,           |
|                                    |          |                           |                                                                | _1732879081689_            |
| Type                               | yes      | enum(see examples)        | Sport Type.                                                    | _“Soccer”_                 |
| VirtualFixture                     | no       | null,boolean              | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_      |
|                                    |          |                           | of an existing fxture for test purposes.                       |                            |
| Kickoff                            |          |                           |                                                                |                            |
| The actual kickoff. Clock and Type |          | can be modifed via action | amend. This action_can be followed up with updates_- new       | messages with the same     |
| action id can update this action.  |          |                           |                                                                |                            |
| Property                           | Required | Type                      | Description                                                    | Examples                   |
| Action                             | yes      | enum(see examples)        | Action Type.                                                   | _“kickoff”_                |
| Clock                              | yes      | Clock                     | Game clock. SeeClock                                           | _See object details_       |
| Confrmed                           | yes      | boolean                   | Action confrmation status. This indicates an action that       | _false_,_true_             |
|                                    |          |                           | actually happened, as opposed to_possible_actions,             |                            |
|                                    |          |                           | however the fnal confrmation is still pending and will be      |                            |
|                                    |          |                           | sent with the same action ID, and potentially more             |                            |
|                                    |          |                           | information related to the action. An unconfrmed event is      |                            |
|                                    |          |                           | closer in time to the event happening, as confrmation          |                            |
|                                    |          |                           | could be delayed by events on feld. Take this in account       |                            |
|                                    |          |                           | when handling the events.                                      |                            |
| ConnectionId                       | yes      | number                    | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_     |
| FixtureId                          | yes      | number                    | The normative Id of the fxture.                                | _10461989_,_10190463_,     |
|                                    |          |                           |                                                                | _10260031_,_10026403_,     |
|                                    |          |                           |                                                                | _10471436_                 |
| Id                                 | yes      | number                    | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_   |
|                                    |          |                           | same action ID. For example, an unconfrmed action              |                            |
|                                    |          |                           | followed by a confrmation.                                     |                            |
| Kickoff                            | yes      | KickoffDetails            | Kick-off information. SeeKickoffDetails                        | _See object details_       |
| Possession                         | no       | number                    | Participant that has the ball. Home/away mapping is            | _1_,_2_                    |
|                                    |          |                           | provided by theParticipant1IsHomefag on the fxture.            |                            |
| PossessionType                     | no       | enum(see examples)        | The danger associated to the current possession.               | _null_,_“SafePossession”_, |
|                                    |          |                           |                                                                | _“AttackPossession”_,      |
|                                    |          |                           |                                                                | _“DangerPossession”_,      |
|                                    |          |                           |                                                                | _“HighDangerPossession”_   |
| Seq                                | yes      | number                    | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_   |
| StatusId                           | yes      | number                    | The ID for the current game period. SeeStatusId.               | _2_,_4_                    |
| Ts                                 | yes      | number                    | Timestamp of the update.                                       | _1732878668797_,           |
|                                    |          |                           |                                                                | _1732878371314_,           |
|                                    |          |                           |                                                                | _1732878438368_,           |
|                                    |          |                           |                                                                | _1732878219489_,           |
|                                    |          |                           |                                                                | _1732879081689_            |
| Type                               | yes      | enum(see examples)        | Sport Type.                                                    | _“Soccer”_                 |
| VirtualFixture                     | no       | null,boolean              | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_      |
|                                    |          |                           | of an existing fxture for test purposes.                       |                            |

## Kickoff Team

The team that will kickoff the game. This action _can be followed up with updates_ - new messages with the same action id can update this action.

TXODDS

21

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“kickoff_team”_         |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_     |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                |          |                    | sent with the same action ID, and potentially more             |                          |
|                |          |                    | information related to the action. An unconfrmed event is      |                          |
|                |          |                    | closer in time to the event happening, as confrmation          |                          |
|                |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                |          |                    | when handling the events.                                      |                          |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Participant    | no       | number,null        | The team that does the kickoff.                                | _null_,_1_,_2_           |
| Possession     | no       | number             | Participant that has the ball. Home/away mapping is            | _1_,_2_                  |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.            |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_                  |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Lineup

Sent when the lineup is confirmed.

| Property     | Required | Type               | Description                                               | Examples                 |
| ------------ | -------- | ------------------ | --------------------------------------------------------- | ------------------------ |
| Action       | yes      | enum(see examples) | Action Type.                                              | _“lineup”_               |
| Clock        | yes      | Clock              | Game clock. SeeClock                                      | _See object details_     |
| Confrmed     | yes      | boolean            | Action confrmation status. This indicates an action that  | _false_,_true_           |
|              |          |                    | actually happened, as opposed to_possible_actions,        |                          |
|              |          |                    | however the fnal confrmation is still pending and will be |                          |
|              |          |                    | sent with the same action ID, and potentially more        |                          |
|              |          |                    | information related to the action. An unconfrmed event is |                          |
|              |          |                    | closer in time to the event happening, as confrmation     |                          |
|              |          |                    | could be delayed by events on feld. Take this in account  |                          |
|              |          |                    | when handling the events.                                 |                          |
| ConnectionId | yes      | number             | Internal ID of the connection.                            | _12_,_13_,_9_,_1_,_18_   |
| FixtureId    | yes      | number             | The normative Id of the fxture.                           | _10461989_,_10190463_,   |
|              |          |                    |                                                           | _10260031_,_10026403_,   |
|              |          |                    |                                                           | _10471436_               |
| Id           | yes      | number             | Action ID. Messages for the same action will have the     | _36_,_18_,_57_,_68_,_99_ |
|              |          |                    | same action ID. For example, an unconfrmed action         |                          |
|              |          |                    | followed by a confrmation.                                |                          |
| Seq          | yes      | number             | Update sequence number for a fxture.                      | _52_,_60_,_74_,_40_,_48_ |
| StatusId     | yes      | number             | The ID for the current game period. SeeStatusId.          | _2_,_4_,_7_,_9_,_12_     |
| Ts           | yes      | number             | Timestamp of the update.                                  | _1732878668797_,         |
|              |          |                    |                                                           | _1732878371314_,         |
|              |          |                    |                                                           | _1732878438368_,         |
|              |          |                    |                                                           | _1732878219489_,         |
|              |          |                    |                                                           | _1732879081689_          |
| Type         | yes      | enum(see examples) | Sport Type.                                               | _“Soccer”_               |

22

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type         | Description                                                    | Examples              |
| -------------- | -------- | ------------ | -------------------------------------------------------------- | --------------------- |
| VirtualFixture | no       | null,boolean | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |              | of an existing fxture for test purposes.                       |                       |

## Lineups

Team lineups (pregame)

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“lineups”_              |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                |          |                    | sent with the same action ID, and potentially more             |                          |
|                |          |                    | information related to the action. An unconfrmed event is      |                          |
|                |          |                    | closer in time to the event happening, as confrmation          |                          |
|                |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                |          |                    | when handling the events.                                      |                          |
| ConnectionId   | no       | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Lineups        | yes      | Array<LineupData>, | Player lineup information.                                     | _See object details_     |
|                |          | null               |                                                                |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | no       | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Penalty Attempt

Indicates a Penalty awarded to a team. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property     | Required | Type               | Description                                               | Examples                 |
| ------------ | -------- | ------------------ | --------------------------------------------------------- | ------------------------ |
| Action       | yes      | enum(see examples) | Action Type.                                              | _“penalty”_              |
| Clock        | yes      | Clock              | Game clock. SeeClock                                      | _See object details_     |
| Confrmed     | yes      | boolean            | Action confrmation status. This indicates an action that  | _false_,_true_           |
|              |          |                    | actually happened, as opposed to_possible_actions,        |                          |
|              |          |                    | however the fnal confrmation is still pending and will be |                          |
|              |          |                    | sent with the same action ID, and potentially more        |                          |
|              |          |                    | information related to the action. An unconfrmed event is |                          |
|              |          |                    | closer in time to the event happening, as confrmation     |                          |
|              |          |                    | could be delayed by events on feld. Take this in account  |                          |
|              |          |                    | when handling the events.                                 |                          |
| ConnectionId | yes      | number             | Internal ID of the connection.                            | _12_,_13_,_9_,_1_,_18_   |
| FixtureId    | yes      | number             | The normative Id of the fxture.                           | _10461989_,_10190463_,   |
|              |          |                    |                                                           | _10260031_,_10026403_,   |
|              |          |                    |                                                           | _10471436_               |
| Id           | yes      | number             | Action ID. Messages for the same action will have the     | _36_,_18_,_57_,_68_,_99_ |
|              |          |                    | same action ID. For example, an unconfrmed action         |                          |
|              |          |                    | followed by a confrmation.                                |                          |
| Participant  | yes      | number             | The team that takes the penalty.                          | _1_,_2_                  |
| Seq          | yes      | number             | Update sequence number for a fxture.                      | _52_,_60_,_74_,_40_,_48_ |

TXODDS

23

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples              |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------- |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_  |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,      |
|                |          |                    |                                                                | _1732878371314_,      |
|                |          |                    |                                                                | _1732878438368_,      |
|                |          |                    |                                                                | _1732878219489_,      |
|                |          |                    |                                                                | _1732879081689_       |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_            |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |                    | of an existing fxture for test purposes.                       |                       |

## Penalty Outcome

Indicates the outcome of a Penalty. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property       | Required | Type                                                                       | Description                                                    | Examples                      |
| -------------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------- |
| Action         | yes      | enum(see examples)                                                         | Action Type.                                                   | _“penalty_outcome”_           |
| Clock          | yes      | Clock                                                                      | Game clock. SeeClock                                           | _See object details_          |
| Confrmed       | yes      | boolean                                                                    | Action confrmation status. This indicates an action that       | _false_,_true_                |
|                |          |                                                                            | actually happened, as opposed to_possible_actions,             |                               |
|                |          |                                                                            | however the fnal confrmation is still pending and will be      |                               |
|                |          |                                                                            | sent with the same action ID, and potentially more             |                               |
|                |          |                                                                            | information related to the action. An unconfrmed event is      |                               |
|                |          |                                                                            | closer in time to the event happening, as confrmation          |                               |
|                |          |                                                                            | could be delayed by events on feld. Take this in account       |                               |
|                |          |                                                                            | when handling the events.                                      |                               |
| ConnectionId   | yes      | number                                                                     | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_        |
| Data           | yes      | object                                                                     | Action specifc info.                                           | _See object details_          |
| Data.Outcome   | no       | enum(see examples)                                                         | The outcome of the penalty.                                    | _null_,_“Scored”_,_“Missed”_, |
|                |          |                                                                            |                                                                | _“Retake”_                    |
| Data.PlayerId  | no       | number,null                                                                | External Id of the player that took the penalty, if            | _null_,_1004569_,             |
|                |          |                                                                            | applicable.                                                    | _3240098_,_8891242_           |
| FixtureId      | yes      | number                                                                     | The normative Id of the fxture.                                | _10461989_,_10190463_,        |
|                |          |                                                                            |                                                                | _10260031_,_10026403_,        |
|                |          |                                                                            |                                                                | _10471436_                    |
| FollowsAction  | no       | number                                                                     | Action ID of a previous action that originated this action.    | _35_,_17_,_56_,_67_,_98_      |
|                |          |                                                                            | It is used to indicate actions that may need to be             |                               |
|                |          |                                                                            | discarded as a unit.                                           |                               |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_      |
|                |          |                                                                            | same action ID. For example, an unconfrmed action              |                               |
|                |          |                                                                            | followed by a confrmation.                                     |                               |
| Kickoff        | no       | KickoffDetails                                                             | Kick-off information. SeeKickoffDetails                        | _See object details_          |
| Participant    | yes      | number                                                                     | The team that took the penalty.                                | _1_,_2_                       |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                                | _See object details_          |
| Score          | no       | Score                                                                      | Score information, referencing the current score of the        | _See object details_          |
|                |          |                                                                            | game, not the change caused by this action. Score is           |                               |
|                |          |                                                                            | provided in actions that can modify the score-line. See        |                               |
|                |          |                                                                            | Score                                                          |                               |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_      |
| StatusId       | yes      | number                                                                     | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_          |
| Ts             | yes      | number                                                                     | Timestamp of the update.                                       | _1732878668797_,              |
|                |          |                                                                            |                                                                | _1732878371314_,              |
|                |          |                                                                            |                                                                | _1732878438368_,              |
|                |          |                                                                            |                                                                | _1732878219489_,              |
|                |          |                                                                            |                                                                | _1732879081689_               |
| Type           | yes      | enum(see examples)                                                         | Sport Type.                                                    | _“Soccer”_                    |
| VirtualFixture | no       | null,boolean                                                               | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_         |
|                |          |                                                                            | of an existing fxture for test purposes.                       |                               |

24

TXODDS

Scores Product API documentation

3 June 2026

## Penalty Shootout Team

The team that will start the penalty shootout. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property       | Required | Type               | Description                                                    | Examples                  |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------- |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“penalty_shootout_team”_ |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_      |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_            |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                           |
|                |          |                    | however the fnal confrmation is still pending and will be      |                           |
|                |          |                    | sent with the same action ID, and potentially more             |                           |
|                |          |                    | information related to the action. An unconfrmed event is      |                           |
|                |          |                    | closer in time to the event happening, as confrmation          |                           |
|                |          |                    | could be delayed by events on feld. Take this in account       |                           |
|                |          |                    | when handling the events.                                      |                           |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_    |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,    |
|                |          |                    |                                                                | _10260031_,_10026403_,    |
|                |          |                    |                                                                | _10471436_                |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_  |
|                |          |                    | same action ID. For example, an unconfrmed action              |                           |
|                |          |                    | followed by a confrmation.                                     |                           |
| Participant    | yes      | number             | The team that starts the shootout.                             | _1_,_2_                   |
| Possession     | no       | number             | Participant that has the ball. Home/away mapping is            | _1_,_2_                   |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.            |                           |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_  |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_                      |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,          |
|                |          |                    |                                                                | _1732878371314_,          |
|                |          |                    |                                                                | _1732878438368_,          |
|                |          |                    |                                                                | _1732878219489_,          |
|                |          |                    |                                                                | _1732879081689_           |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_     |
|                |          |                    | of an existing fxture for test purposes.                       |                           |

## Player Stats Adjustment

Player stats adjustment message. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property     | Required | Type                                                                       | Description                                                 | Examples                    |
| ------------ | -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------- |
| Action       | yes      | enum(see examples)                                                         | Action Type.                                                | _“player_stats_adjustment”_ |
| Clock        | yes      | Clock                                                                      | Game clock. SeeClock                                        | _See object details_        |
| ConnectionId | yes      | number                                                                     | Internal ID of the connection.                              | _12_,_13_,_9_,_1_,_18_      |
| Data         | yes      | object                                                                     | Action specifc info.                                        | _See object details_        |
| Data.        | no       | Map<number,                                                                | Player statistics for the referenced player. SeePlayerStats | _See object details_        |
| Participant1 |          | PlayerStats>                                                               |                                                             |                             |
| Data.        | no       | Map<number,                                                                | Player statistics for the referenced player. SeePlayerStats | _See object details_        |
| Participant2 |          | PlayerStats>                                                               |                                                             |                             |
| FixtureId    | yes      | number                                                                     | The normative Id of the fxture.                             | _10461989_,_10190463_,      |
|              |          |                                                                            |                                                             | _10260031_,_10026403_,      |
|              |          |                                                                            |                                                             | _10471436_                  |
| Id           | yes      | number                                                                     | Action ID. Messages for the same action will have the       | _36_,_18_,_57_,_68_,_99_    |
|              |          |                                                                            | same action ID. For example, an unconfrmed action           |                             |
|              |          |                                                                            | followed by a confrmation.                                  |                             |
| PlayerStats  | yes      | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                             | _See object details_        |
| Seq          | yes      | number                                                                     | Update sequence number for a fxture.                        | _52_,_60_,_74_,_40_,_48_    |
| StatusId     | yes      | number                                                                     | The ID for the current game period. SeeStatusId.            | _2_,_4_,_7_,_9_,_12_        |

TXODDS

25

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples              |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------- |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,      |
|                |          |                    |                                                                | _1732878371314_,      |
|                |          |                    |                                                                | _1732878438368_,      |
|                |          |                    |                                                                | _1732878219489_,      |
|                |          |                    |                                                                | _1732879081689_       |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_            |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |                    | of an existing fxture for test purposes.                       |                       |

## Players on the pitch

Sent when the players come out onto the pitch before the game.

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“players_on_the_pitch”_ |
| Clock          | no       | Clock              | Game clock. SeeClock                                           | _See object details_     |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                |          |                    | sent with the same action ID, and potentially more             |                          |
|                |          |                    | information related to the action. An unconfrmed event is      |                          |
|                |          |                    | closer in time to the event happening, as confrmation          |                          |
|                |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                |          |                    | when handling the events.                                      |                          |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | no       | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Players on the pitch Adjustment

Adjustment message for players currently on the pitch. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property     | Required | Type               | Description                                           | Examples                            |
| ------------ | -------- | ------------------ | ----------------------------------------------------- | ----------------------------------- |
| Action       | yes      | enum(see examples) | Action Type.                                          | _“players_on_the_pitch_adjustment”_ |
| Clock        | no       | Clock              | Game clock. SeeClock                                  | _See object details_                |
| ConnectionId | yes      | number             | Internal ID of the connection.                        | _12_,_13_,_9_,_1_,_18_              |
| Data         | yes      | PlayersOnPitch     | Players currently on the pitch for both teams. See    | _See object details_                |
|              |          |                    | PlayersOnPitch                                        |                                     |
| FixtureId    | yes      | number             | The normative Id of the fxture.                       | _10461989_,_10190463_,              |
|              |          |                    |                                                       | _10260031_,_10026403_,              |
|              |          |                    |                                                       | _10471436_                          |
| Id           | yes      | number             | Action ID. Messages for the same action will have the | _36_,_18_,_57_,_68_,_99_            |
|              |          |                    | same action ID. For example, an unconfrmed action     |                                     |
|              |          |                    | followed by a confrmation.                            |                                     |

26

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | no       | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Players Warming Up

Sent pre-game when the players are doing their warmup routines.

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“players_warming_up”_   |
| Clock          | no       | Clock              | Game clock. SeeClock                                           | _See object details_     |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                |          |                    | actually happened, as opposed to_possible_actions,             |                          |
|                |          |                    | however the fnal confrmation is still pending and will be      |                          |
|                |          |                    | sent with the same action ID, and potentially more             |                          |
|                |          |                    | information related to the action. An unconfrmed event is      |                          |
|                |          |                    | closer in time to the event happening, as confrmation          |                          |
|                |          |                    | could be delayed by events on feld. Take this in account       |                          |
|                |          |                    | when handling the events.                                      |                          |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | no       | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Possession

The participant takes possession of the ball. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property     | Required | Type               | Description                                           | Examples                 |
| ------------ | -------- | ------------------ | ----------------------------------------------------- | ------------------------ |
| Action       | yes      | enum(see examples) | Action Type.                                          | _“possession”_           |
| Clock        | yes      | Clock              | Game clock. SeeClock                                  | _See object details_     |
| ConnectionId | yes      | number             | Internal ID of the connection.                        | _12_,_13_,_9_,_1_,_18_   |
| FixtureId    | yes      | number             | The normative Id of the fxture.                       | _10461989_,_10190463_,   |
|              |          |                    |                                                       | _10260031_,_10026403_,   |
|              |          |                    |                                                       | _10471436_               |
| Id           | yes      | number             | Action ID. Messages for the same action will have the | _36_,_18_,_57_,_68_,_99_ |
|              |          |                    | same action ID. For example, an unconfrmed action     |                          |
|              |          |                    | followed by a confrmation.                            |                          |
| Participant  | yes      | number             | The team that has possession of the ball.             | _1_,_2_                  |

TXODDS

27

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                   |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | -------------------------- |
| Possession     | yes      | number             | Participant that has the ball. Home/away mapping is            | _1_,_2_                    |
|                |          |                    | provided by theParticipant1IsHomefag on the fxture.            |                            |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.               | _null_,_“SafePossession”_, |
|                |          |                    |                                                                | _“AttackPossession”_,      |
|                |          |                    |                                                                | _“DangerPossession”_,      |
|                |          |                    |                                                                | _“HighDangerPossession”_   |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_   |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_       |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,           |
|                |          |                    |                                                                | _1732878371314_,           |
|                |          |                    |                                                                | _1732878438368_,           |
|                |          |                    |                                                                | _1732878219489_,           |
|                |          |                    |                                                                | _1732879081689_            |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                 |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_      |
|                |          |                    | of an existing fxture for test purposes.                       |                            |

## Possible

Indicates a possible event, either in game or for a specific participant. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property        | Required | Type                 | Description                                                    | Examples                 |
| --------------- | -------- | -------------------- | -------------------------------------------------------------- | ------------------------ |
| Action          | yes      | enum(see examples)   | Action Type.                                                   | _“possible”_             |
| Clock           | yes      | Clock                | Game clock. SeeClock                                           | _See object details_     |
| ConnectionId    | yes      | number               | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data            | yes      | object               | Action specifc info.                                           | _See object details_     |
| Data.Corner     | no       | boolean              | A possible corner.                                             | _false_,_true_           |
| Data.Goal       | no       | boolean              | A possible goal.                                               | _false_,_true_           |
| Data.Penalty    | no       | boolean              | A possible penalty.                                            | _false_,_true_           |
| Data.RedCard    | no       | boolean              | A possible red card in play.                                   | _false_,_true_           |
| Data.VAR        | no       | boolean              | A possible VAR review in play.                                 | _false_,_true_           |
| Data.YellowCard | no       | boolean              | A possible yellow card in play.                                | _false_,_true_           |
| FixtureId       | yes      | number               | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                 |          |                      |                                                                | _10260031_,_10026403_,   |
|                 |          |                      |                                                                | _10471436_               |
| Id              | yes      | number               | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                 |          |                      | same action ID. For example, an unconfrmed action              |                          |
|                 |          |                      | followed by a confrmation.                                     |                          |
| Parti1State     | yes      | PartiState           | State for theParticipant1. Home/away mapping is                | _See object details_     |
|                 |          |                      | provided by theParticipant1IsHomefag on the fxture.            |                          |
|                 |          |                      | SeePartiState                                                  |                          |
| Parti2State     | yes      | PartiState           | State for theParticipant2. Home/away mapping is                | _See object details_     |
|                 |          |                      | provided by theParticipant1IsHomefag on the fxture.            |                          |
|                 |          |                      | SeePartiState                                                  |                          |
| Participant     | no       | number,null          | The team for which we signal a possible event. If missing      | _null_,_1_,_2_           |
|                 |          |                      | or null, the event is for the whole game.                      |                          |
| PossibleEvent   | yes      | PossibleNeutralEvent | Possible events active in the game. They affect both           | _See object details_     |
|                 |          |                      | teams. SeePossibleNeutralEvent                                 |                          |
| Seq             | yes      | number               | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId        | yes      | number               | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_     |
| Ts              | yes      | number               | Timestamp of the update.                                       | _1732878668797_,         |
|                 |          |                      |                                                                | _1732878371314_,         |
|                 |          |                      |                                                                | _1732878438368_,         |
|                 |          |                      |                                                                | _1732878219489_,         |
|                 |          |                      |                                                                | _1732879081689_          |
| Type            | yes      | enum(see examples)   | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture  | no       | null,boolean         | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                 |          |                      | of an existing fxture for test purposes.                       |                          |

28

TXODDS

Scores Product API documentation

3 June 2026

## Red Card

A player has received a Red card. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property       | Required | Type                                                                       | Description                                                    | Examples                 |
| -------------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples)                                                         | Action Type.                                                   | _“red_card”_             |
| Clock          | yes      | Clock                                                                      | Game clock. SeeClock                                           | _See object details_     |
| Confrmed       | yes      | boolean                                                                    | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                |          |                                                                            | actually happened, as opposed to_possible_actions,             |                          |
|                |          |                                                                            | however the fnal confrmation is still pending and will be      |                          |
|                |          |                                                                            | sent with the same action ID, and potentially more             |                          |
|                |          |                                                                            | information related to the action. An unconfrmed event is      |                          |
|                |          |                                                                            | closer in time to the event happening, as confrmation          |                          |
|                |          |                                                                            | could be delayed by events on feld. Take this in account       |                          |
|                |          |                                                                            | when handling the events.                                      |                          |
| ConnectionId   | yes      | number                                                                     | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data           | yes      | object                                                                     | Action specifc info.                                           | _See object details_     |
| Data.PlayerId  | no       | number,null                                                                | External Id of the player that received the yellow card, if    | _null_,_1004569_,        |
|                |          |                                                                            | applicable.                                                    | _3240098_,_8891242_      |
| Data.Type      | no       | enum(see examples)                                                         | Type of Red card.                                              | _null_,_“StraightRed”_,  |
|                |          |                                                                            |                                                                | _“SecondYellow”_         |
| FixtureId      | yes      | number                                                                     | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                                                                            |                                                                | _10260031_,_10026403_,   |
|                |          |                                                                            |                                                                | _10471436_               |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                                                                            | same action ID. For example, an unconfrmed action              |                          |
|                |          |                                                                            | followed by a confrmation.                                     |                          |
| Participant    | yes      | number                                                                     | The team that gets the card.                                   | _1_,_2_                  |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                                | _See object details_     |
| Score          | no       | Score                                                                      | Score information, referencing the current score of the        | _See object details_     |
|                |          |                                                                            | game, not the change caused by this action. Score is           |                          |
|                |          |                                                                            | provided in actions that can modify the score-line. See        |                          |
|                |          |                                                                            | Score                                                          |                          |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number                                                                     | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_     |
| Ts             | yes      | number                                                                     | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                                                                            |                                                                | _1732878371314_,         |
|                |          |                                                                            |                                                                | _1732878438368_,         |
|                |          |                                                                            |                                                                | _1732878219489_,         |
|                |          |                                                                            |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples)                                                         | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean                                                               | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                                                                            | of an existing fxture for test purposes.                       |                          |

## Safe Possession

The participant has the ball in the safe possession area. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property     | Required | Type               | Description                                           | Examples                 |
| ------------ | -------- | ------------------ | ----------------------------------------------------- | ------------------------ |
| Action       | yes      | enum(see examples) | Action Type.                                          | _“safe_possession”_      |
| Clock        | yes      | Clock              | Game clock. SeeClock                                  | _See object details_     |
| ConnectionId | yes      | number             | Internal ID of the connection.                        | _12_,_13_,_9_,_1_,_18_   |
| FixtureId    | yes      | number             | The normative Id of the fxture.                       | _10461989_,_10190463_,   |
|              |          |                    |                                                       | _10260031_,_10026403_,   |
|              |          |                    |                                                       | _10471436_               |
| Id           | yes      | number             | Action ID. Messages for the same action will have the | _36_,_18_,_57_,_68_,_99_ |
|              |          |                    | same action ID. For example, an unconfrmed action     |                          |
|              |          |                    | followed by a confrmation.                            |                          |
| Participant  | yes      | number             | The team that has possession of the ball.             | _1_,_2_                  |
| Possession   | no       | number             | Participant that has the ball. Home/away mapping is   | _1_,_2_                  |
|              |          |                    | provided by theParticipant1IsHomefag on the fxture.   |                          |

TXODDS

29

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| PossessionType | no       | enum(see examples) | The danger associated to the current possession.               | _“SafePossession”_,      |
|                |          |                    |                                                                | _“AttackPossession”_,    |
|                |          |                    |                                                                | _“DangerPossession”_,    |
|                |          |                    |                                                                | _“HighDangerPossession”_ |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_     |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Score Adjustment

Score adjustment. In cases when there are missed scoring data updates (e.g. goals) or if there were no updates for a period due to unforeseen circumstances, a score adjustment may be sent that will update ONLY the main score for a given half or period. Once that happens, the other stats in the given half may not be accurate any more. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“score_adjustment”_     |
| Clock          | yes      | Clock              | Game clock. SeeClock                                           | _See object details_     |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data           | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.          | yes      | ScoreParticipant   | The score for participant 1. SeeScoreParticipant               | _See object details_     |
| Participant1   |          |                    |                                                                |                          |
| Data.          | yes      | ScoreParticipant   | The score for participant 2. SeeScoreParticipant               | _See object details_     |
| Participant2   |          |                    |                                                                |                          |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Score          | yes      | Score              | Score information, referencing the current score of the        | _See object details_     |
|                |          |                    | game, not the change caused by this action. Score is           |                          |
|                |          |                    | provided in actions that can modify the score-line. See        |                          |
|                |          |                    | Score                                                          |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Shot

Indicates a shot attempt by a player. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property | Required | Type               | Description          | Examples             |
| -------- | -------- | ------------------ | -------------------- | -------------------- |
| Action   | yes      | enum(see examples) | Action Type.         | _“shot”_             |
| Clock    | yes      | Clock              | Game clock. SeeClock | _See object details_ |

30

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type                                                                       | Description                                                    | Examples                 |
| -------------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| Confrmed       | yes      | boolean                                                                    | Action confrmation status. This indicates an action that       | _false_,_true_           |
|                |          |                                                                            | actually happened, as opposed to_possible_actions,             |                          |
|                |          |                                                                            | however the fnal confrmation is still pending and will be      |                          |
|                |          |                                                                            | sent with the same action ID, and potentially more             |                          |
|                |          |                                                                            | information related to the action. An unconfrmed event is      |                          |
|                |          |                                                                            | closer in time to the event happening, as confrmation          |                          |
|                |          |                                                                            | could be delayed by events on feld. Take this in account       |                          |
|                |          |                                                                            | when handling the events.                                      |                          |
| ConnectionId   | yes      | number                                                                     | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data           | yes      | object                                                                     | Action specifc info.                                           | _See object details_     |
| Data.Outcome   | no       | enum(see examples)                                                         | The outcome of the shot.                                       | _null_,_“OnTarget”_,     |
|                |          |                                                                            |                                                                | _“OffTarget”_,           |
|                |          |                                                                            |                                                                | _“Woodwork”_,_“Blocked”_ |
| Data.PlayerId  | no       | number,null                                                                | External Id of the player that made the shot, if applicable.   | _null_,_1004569_,        |
|                |          |                                                                            |                                                                | _3240098_,_8891242_      |
| FixtureId      | yes      | number                                                                     | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                                                                            |                                                                | _10260031_,_10026403_,   |
|                |          |                                                                            |                                                                | _10471436_               |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                                                                            | same action ID. For example, an unconfrmed action              |                          |
|                |          |                                                                            | followed by a confrmation.                                     |                          |
| Participant    | yes      | number                                                                     | The team that attempts the shot.                               | _1_,_2_                  |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                                | _See object details_     |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number                                                                     | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_     |
| Ts             | yes      | number                                                                     | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                                                                            |                                                                | _1732878371314_,         |
|                |          |                                                                            |                                                                | _1732878438368_,         |
|                |          |                                                                            |                                                                | _1732878219489_,         |
|                |          |                                                                            |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples)                                                         | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean                                                               | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                                                                            | of an existing fxture for test purposes.                       |                          |

## Standby

Sent just before the start of the game and additional periods. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property     | Required | Type               | Description                                               | Examples                   |
| ------------ | -------- | ------------------ | --------------------------------------------------------- | -------------------------- |
| Action       | yes      | enum(see examples) | Action Type.                                              | _“standby”_                |
| Clock        | no       | Clock              | Game clock. SeeClock                                      | _See object details_       |
| Confrmed     | yes      | boolean            | Action confrmation status. This indicates an action that  | _false_,_true_             |
|              |          |                    | actually happened, as opposed to_possible_actions,        |                            |
|              |          |                    | however the fnal confrmation is still pending and will be |                            |
|              |          |                    | sent with the same action ID, and potentially more        |                            |
|              |          |                    | information related to the action. An unconfrmed event is |                            |
|              |          |                    | closer in time to the event happening, as confrmation     |                            |
|              |          |                    | could be delayed by events on feld. Take this in account  |                            |
|              |          |                    | when handling the events.                                 |                            |
| ConnectionId | yes      | number             | Internal ID of the connection.                            | _12_,_13_,_9_,_1_,_18_     |
| FixtureGroup | no       | null,string        | Name of the competition associated to the fxture.         | _null_,_“PremierLeague”_,  |
|              |          |                    |                                                           | _“LaLiga”_                 |
| FixtureId    | yes      | number             | The normative Id of the fxture.                           | _10461989_,_10190463_,     |
|              |          |                    |                                                           | _10260031_,_10026403_,     |
|              |          |                    |                                                           | _10471436_                 |
| GameType     | no       | enum(see examples) | Type of game, by duration of each half.                   | _null_,_“2x45m”_,_“2x40m”_ |
| Id           | yes      | number             | Action ID. Messages for the same action will have the     | _36_,_18_,_57_,_68_,_99_   |
|              |          |                    | same action ID. For example, an unconfrmed action         |                            |
|              |          |                    | followed by a confrmation.                                |                            |
| Seq          | yes      | number             | Update sequence number for a fxture.                      | _52_,_60_,_74_,_40_,_48_   |

TXODDS

31

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples              |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------- |
| StatusId       | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_  |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,      |
|                |          |                    |                                                                | _1732878371314_,      |
|                |          |                    |                                                                | _1732878438368_,      |
|                |          |                    |                                                                | _1732878219489_,      |
|                |          |                    |                                                                | _1732879081689_       |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_            |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |                    | of an existing fxture for test purposes.                       |                       |

## Status

Sets the current game status/period. It can be deleted/canceled. Overtime is signalled with an additional field included only during overtime. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property           | Required | Type               | Description                                                    | Examples                      |
| ------------------ | -------- | ------------------ | -------------------------------------------------------------- | ----------------------------- |
| Action             | yes      | enum(see examples) | Action Type.                                                   | _“status”_                    |
| Clock              | yes      | Clock              | Game clock. SeeClock                                           | _See object details_          |
| ConnectionId       | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_        |
| Data               | yes      | object             | Action specifc info.                                           | _See object details_          |
| Data.              | no       | boolean            | Set to true if the game status was updated through the         | _false_,_true_                |
| ManualStatusChange |          |                    | manual status change feature.                                  |                               |
| Data.StatusId      | no       | number             | The id for the current game status/period.                     | _2_,_4_,_7_,_9_,_12_          |
| Data.              | no       | string             | The name associated to the status id.                          | _“NS”_,_“H1”_,_“H2”_,_“ET1”_, |
| StatusName         |          |                    |                                                                | _“F”_                         |
| FixtureId          | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,        |
|                    |          |                    |                                                                | _10260031_,_10026403_,        |
|                    |          |                    |                                                                | _10471436_                    |
| Id                 | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_      |
|                    |          |                    | same action ID. For example, an unconfrmed action              |                               |
|                    |          |                    | followed by a confrmation.                                     |                               |
| Kickoff            | no       | KickoffDetails     | Kick-off information. SeeKickoffDetails                        | _See object details_          |
| Seq                | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_      |
| StatusId           | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_          |
| Ts                 | yes      | number             | Timestamp of the update.                                       | _1732878668797_,              |
|                    |          |                    |                                                                | _1732878371314_,              |
|                    |          |                    |                                                                | _1732878438368_,              |
|                    |          |                    |                                                                | _1732878219489_,              |
|                    |          |                    |                                                                | _1732879081689_               |
| Type               | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                    |
| VirtualFixture     | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_         |
|                    |          |                    | of an existing fxture for test purposes.                       |                               |

## Substitution

Sent when a team makes a substitution. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property | Required | Type               | Description                                               | Examples             |
| -------- | -------- | ------------------ | --------------------------------------------------------- | -------------------- |
| Action   | yes      | enum(see examples) | Action Type.                                              | _“substitution”_     |
| Clock    | yes      | Clock              | Game clock. SeeClock                                      | _See object details_ |
| Confrmed | yes      | boolean            | Action confrmation status. This indicates an action that  | _false_,_true_       |
|          |          |                    | actually happened, as opposed to_possible_actions,        |                      |
|          |          |                    | however the fnal confrmation is still pending and will be |                      |
|          |          |                    | sent with the same action ID, and potentially more        |                      |
|          |          |                    | information related to the action. An unconfrmed event is |                      |
|          |          |                    | closer in time to the event happening, as confrmation     |                      |
|          |          |                    | could be delayed by events on feld. Take this in account  |                      |
|          |          |                    | when handling the events.                                 |                      |

32

TXODDS

Scores Product API documentation

3 June 2026

| Property         | Required | Type               | Description                                                    | Examples                 |
| ---------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| ConnectionId     | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data             | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.Participant | no       | number             | Team making the substitution.                                  | _1_,_2_                  |
| Data.PlayerInId  | no       | number,null        | External Id of the player entering the feld.                   | _null_,_3290005_,        |
|                  |          |                    |                                                                | _5020305_,_1290003_      |
| Data.            | no       | number,null        | External Id of the player leaving the feld.                    | _null_,_3290005_,        |
| PlayerOutId      |          |                    |                                                                | _5020305_,_1290003_      |
| FixtureId        | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                  |          |                    |                                                                | _10260031_,_10026403_,   |
|                  |          |                    |                                                                | _10471436_               |
| FollowsAction    | no       | number             | Action ID of a previous action that originated this action.    | _35_,_17_,_56_,_67_,_98_ |
|                  |          |                    | It is used to indicate actions that may need to be             |                          |
|                  |          |                    | discarded as a unit.                                           |                          |
| Id               | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                  |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                  |          |                    | followed by a confrmation.                                     |                          |
| Seq              | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId         | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts               | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                  |          |                    |                                                                | _1732878371314_,         |
|                  |          |                    |                                                                | _1732878438368_,         |
|                  |          |                    |                                                                | _1732878219489_,         |
|                  |          |                    |                                                                | _1732879081689_          |
| Type             | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture   | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                  |          |                    | of an existing fxture for test purposes.                       |                          |

## Suspend

Used to set the game to unreliable and back to reliable if required due to any serious unforeseen situations with coverage, stats, or other circumstances. Upon match starting and if no previous suspend action is sent, Reliable is assumed. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type               | Description                                               | Examples                 |
| -------------- | -------- | ------------------ | --------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                              | _“suspend”_              |
| Clock          | no       | Clock              | Game clock. SeeClock                                      | _See object details_     |
| Confrmed       | yes      | boolean            | Action confrmation status. This indicates an action that  | _false_,_true_           |
|                |          |                    | actually happened, as opposed to_possible_actions,        |                          |
|                |          |                    | however the fnal confrmation is still pending and will be |                          |
|                |          |                    | sent with the same action ID, and potentially more        |                          |
|                |          |                    | information related to the action. An unconfrmed event is |                          |
|                |          |                    | closer in time to the event happening, as confrmation     |                          |
|                |          |                    | could be delayed by events on feld. Take this in account  |                          |
|                |          |                    | when handling the events.                                 |                          |
| ConnectionId   | yes      | number             | Internal ID of the connection.                            | _12_,_13_,_9_,_1_,_18_   |
| Data           | yes      | object             | Action specifc info.                                      | _See object details_     |
| Data.IsAnalyst | no       | boolean,null       | True if the sender of the message is an analyst.          | _null_,_true_,_false_    |
| Data.Locked    | no       | boolean,null       | True if the scout is locked out of the fxture.            | _null_,_true_,_false_    |
| Data.Reliable  | no       | boolean,null       | True if the match information is reliable.                | _null_,_true_,_false_    |
| FixtureId      | yes      | number             | The normative Id of the fxture.                           | _10461989_,_10190463_,   |
|                |          |                    |                                                           | _10260031_,_10026403_,   |
|                |          |                    |                                                           | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the     | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action         |                          |
|                |          |                    | followed by a confrmation.                                |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                      | _52_,_60_,_74_,_40_,_48_ |
| Ts             | yes      | number             | Timestamp of the update.                                  | _1732878668797_,         |
|                |          |                    |                                                           | _1732878371314_,         |
|                |          |                    |                                                           | _1732878438368_,         |
|                |          |                    |                                                           | _1732878219489_,         |
|                |          |                    |                                                           | _1732879081689_          |

TXODDS

33

Scores Product API documentation

3 June 2026

| Property       | Required | Type               | Description                                                    | Examples              |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------- |
| Type           | no       | enum(see examples) | Sport Type.                                                    | _“Soccer”_            |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |                    | of an existing fxture for test purposes.                       |                       |

## Throw In

Indicates a Throw In. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property       | Required | Type                 | Description                                                    | Examples                    |
| -------------- | -------- | -------------------- | -------------------------------------------------------------- | --------------------------- |
| Action         | yes      | enum(see examples)   | Action Type.                                                   | _“throw_in”_                |
| Clock          | yes      | Clock                | Game clock. SeeClock                                           | _See object details_        |
| Confrmed       | yes      | boolean              | Action confrmation status. This indicates an action that       | _false_,_true_              |
|                |          |                      | actually happened, as opposed to_possible_actions,             |                             |
|                |          |                      | however the fnal confrmation is still pending and will be      |                             |
|                |          |                      | sent with the same action ID, and potentially more             |                             |
|                |          |                      | information related to the action. An unconfrmed event is      |                             |
|                |          |                      | closer in time to the event happening, as confrmation          |                             |
|                |          |                      | could be delayed by events on feld. Take this in account       |                             |
|                |          |                      | when handling the events.                                      |                             |
| ConnectionId   | yes      | number               | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_      |
| Data           | yes      | object               | Action specifc info.                                           | _See object details_        |
| Data.          | no       | enum(see examples)   | The danger zone associated to the throw in.                    | _null_,_“Safe”_,_“Attack”_, |
| ThrowInType    |          |                      |                                                                | _“Danger”_                  |
| FixtureId      | yes      | number               | The normative Id of the fxture.                                | _10461989_,_10190463_,      |
|                |          |                      |                                                                | _10260031_,_10026403_,      |
|                |          |                      |                                                                | _10471436_                  |
| Id             | yes      | number               | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_    |
|                |          |                      | same action ID. For example, an unconfrmed action              |                             |
|                |          |                      | followed by a confrmation.                                     |                             |
| Parti1State    | no       | PartiState           | State for theParticipant1. Home/away mapping is                | _See object details_        |
|                |          |                      | provided by theParticipant1IsHomefag on the fxture.            |                             |
|                |          |                      | SeePartiState                                                  |                             |
| Parti2State    | no       | PartiState           | State for theParticipant2. Home/away mapping is                | _See object details_        |
|                |          |                      | provided by theParticipant1IsHomefag on the fxture.            |                             |
|                |          |                      | SeePartiState                                                  |                             |
| Participant    | yes      | number               | The team that scores the goal.                                 | _1_,_2_                     |
| Possession     | no       | number               | Participant that has the ball. Home/away mapping is            | _1_,_2_                     |
|                |          |                      | provided by theParticipant1IsHomefag on the fxture.            |                             |
| PossessionType | no       | enum(see examples)   | The danger associated to the current possession.               | _null_,_“SafePossession”_,  |
|                |          |                      |                                                                | _“AttackPossession”_,       |
|                |          |                      |                                                                | _“DangerPossession”_,       |
|                |          |                      |                                                                | _“HighDangerPossession”_    |
| PossibleEvent  | no       | PossibleNeutralEvent | Possible events active in the game. They affect both           | _See object details_        |
|                |          |                      | teams. SeePossibleNeutralEvent                                 |                             |
| Seq            | yes      | number               | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_    |
| StatusId       | yes      | number               | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_        |
| Ts             | yes      | number               | Timestamp of the update.                                       | _1732878668797_,            |
|                |          |                      |                                                                | _1732878371314_,            |
|                |          |                      |                                                                | _1732878438368_,            |
|                |          |                      |                                                                | _1732878219489_,            |
|                |          |                      |                                                                | _1732879081689_             |
| Type           | yes      | enum(see examples)   | Sport Type.                                                    | _“Soccer”_                  |
| VirtualFixture | no       | null,boolean         | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_       |
|                |          |                      | of an existing fxture for test purposes.                       |                             |

## Unreliable Corners

Indicates that the stats for corners for both teams may be unreliable. It is being verified.. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

34

TXODDS

Scores Product API documentation

3 June 2026

| Property          | Required | Type               | Description                                                    | Examples                 |
| ----------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action            | yes      | enum(see examples) | Action Type.                                                   | _“unreliable_corners”_   |
| Clock             | yes      | Clock              | Game clock. SeeClock                                           | _See object details_     |
| ConnectionId      | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data              | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.Unreliable   | no       | boolean            | If true, it indicates the stats for corners for both teams     | _true_,_false_           |
|                   |          |                    | may be unreliable and it is being verifed.                     |                          |
| FixtureId         | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                   |          |                    |                                                                | _10260031_,_10026403_,   |
|                   |          |                    |                                                                | _10471436_               |
| Id                | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                   |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                   |          |                    | followed by a confrmation.                                     |                          |
| Seq               | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId          | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_     |
| Ts                | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                   |          |                    |                                                                | _1732878371314_,         |
|                   |          |                    |                                                                | _1732878438368_,         |
|                   |          |                    |                                                                | _1732878219489_,         |
|                   |          |                    |                                                                | _1732879081689_          |
| Type              | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| UnreliableCorners | no       | boolean            | If true, it indicates the stats for corners for both teams     | _true_,_false_           |
|                   |          |                    | may be unreliable and it is being verifed.                     |                          |
| VirtualFixture    | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                   |          |                    | of an existing fxture for test purposes.                       |                          |

## Unreliable Yellow Cards

Indicates that the count of yellow and red cards for both teams may be unreliable. It is being verified.. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property        | Required | Type               | Description                                                    | Examples                    |
| --------------- | -------- | ------------------ | -------------------------------------------------------------- | --------------------------- |
| Action          | yes      | enum(see examples) | Action Type.                                                   | _“unreliable_yellow_cards”_ |
| Clock           | yes      | Clock              | Game clock. SeeClock                                           | _See object details_        |
| ConnectionId    | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_      |
| Data            | yes      | object             | Action specifc info.                                           | _See object details_        |
| Data.Unreliable | no       | boolean            | If true, it indicates the count of yellow and red cards for    | _true_,_false_              |
|                 |          |                    | both teams may be unreliable and it is being verifed.          |                             |
| FixtureId       | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,      |
|                 |          |                    |                                                                | _10260031_,_10026403_,      |
|                 |          |                    |                                                                | _10471436_                  |
| Id              | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_    |
|                 |          |                    | same action ID. For example, an unconfrmed action              |                             |
|                 |          |                    | followed by a confrmation.                                     |                             |
| Seq             | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_    |
| StatusId        | yes      | number             | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_        |
| Ts              | yes      | number             | Timestamp of the update.                                       | _1732878668797_,            |
|                 |          |                    |                                                                | _1732878371314_,            |
|                 |          |                    |                                                                | _1732878438368_,            |
|                 |          |                    |                                                                | _1732878219489_,            |
|                 |          |                    |                                                                | _1732879081689_             |
| Type            | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_                  |
| UnreliableCards | no       | boolean            | If true, it indicates the stats for corners for both teams     | _true_,_false_              |
|                 |          |                    | may be unreliable and it is being verifed.                     |                             |
| VirtualFixture  | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_       |
|                 |          |                    | of an existing fxture for test purposes.                       |                             |

## VAR

Indicates a VAR (Video Assistant Referee) review has started. This action _can be followed up with updates_ - new messages with the same action id can update this action.

TXODDS

35

Scores Product API documentation

3 June 2026

| Property       | Required | Type                                                                       | Description                                                    | Examples                     |
| -------------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------- |
| Action         | yes      | enum(see examples)                                                         | Action Type.                                                   | _“var”_                      |
| Clock          | yes      | Clock                                                                      | Game clock. SeeClock                                           | _See object details_         |
| Confrmed       | yes      | boolean                                                                    | Action confrmation status. This indicates an action that       | _false_,_true_               |
|                |          |                                                                            | actually happened, as opposed to_possible_actions,             |                              |
|                |          |                                                                            | however the fnal confrmation is still pending and will be      |                              |
|                |          |                                                                            | sent with the same action ID, and potentially more             |                              |
|                |          |                                                                            | information related to the action. An unconfrmed event is      |                              |
|                |          |                                                                            | closer in time to the event happening, as confrmation          |                              |
|                |          |                                                                            | could be delayed by events on feld. Take this in account       |                              |
|                |          |                                                                            | when handling the events.                                      |                              |
| ConnectionId   | yes      | number                                                                     | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_       |
| Data           | yes      | object                                                                     | Action specifc info.                                           | _See object details_         |
| Data.Type      | no       | enum(see examples)                                                         | What action is being reviewed.                                 | _null_,_“Goal”_,_“Penalty”_, |
|                |          |                                                                            |                                                                | _“RedCard”_,                 |
|                |          |                                                                            |                                                                | _“SecondYellowCard”_,        |
|                |          |                                                                            |                                                                | _“CornerKick”_,              |
|                |          |                                                                            |                                                                | _“MistakenIdentity”_,        |
|                |          |                                                                            |                                                                | _“Other”_                    |
| FixtureId      | yes      | number                                                                     | The normative Id of the fxture.                                | _10461989_,_10190463_,       |
|                |          |                                                                            |                                                                | _10260031_,_10026403_,       |
|                |          |                                                                            |                                                                | _10471436_                   |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_     |
|                |          |                                                                            | same action ID. For example, an unconfrmed action              |                              |
|                |          |                                                                            | followed by a confrmation.                                     |                              |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                                | _See object details_         |
| Score          | no       | Score                                                                      | Score information, referencing the current score of the        | _See object details_         |
|                |          |                                                                            | game, not the change caused by this action. Score is           |                              |
|                |          |                                                                            | provided in actions that can modify the score-line. See        |                              |
|                |          |                                                                            | Score                                                          |                              |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_     |
| StatusId       | yes      | number                                                                     | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_         |
| Ts             | yes      | number                                                                     | Timestamp of the update.                                       | _1732878668797_,             |
|                |          |                                                                            |                                                                | _1732878371314_,             |
|                |          |                                                                            |                                                                | _1732878438368_,             |
|                |          |                                                                            |                                                                | _1732878219489_,             |
|                |          |                                                                            |                                                                | _1732879081689_              |
| Type           | yes      | enum(see examples)                                                         | Sport Type.                                                    | _“Soccer”_                   |
| VirtualFixture | no       | null,boolean                                                               | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_        |
|                |          |                                                                            | of an existing fxture for test purposes.                       |                              |

## VAR End

Indicates a VAR (Video Assistant Referee) review has ended. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property     | Required | Type               | Description                                               | Examples               |
| ------------ | -------- | ------------------ | --------------------------------------------------------- | ---------------------- |
| Action       | yes      | enum(see examples) | Action Type.                                              | _“var_end”_            |
| Clock        | yes      | Clock              | Game clock. SeeClock                                      | _See object details_   |
| Confrmed     | yes      | boolean            | Action confrmation status. This indicates an action that  | _false_,_true_         |
|              |          |                    | actually happened, as opposed to_possible_actions,        |                        |
|              |          |                    | however the fnal confrmation is still pending and will be |                        |
|              |          |                    | sent with the same action ID, and potentially more        |                        |
|              |          |                    | information related to the action. An unconfrmed event is |                        |
|              |          |                    | closer in time to the event happening, as confrmation     |                        |
|              |          |                    | could be delayed by events on feld. Take this in account  |                        |
|              |          |                    | when handling the events.                                 |                        |
| ConnectionId | yes      | number             | Internal ID of the connection.                            | _12_,_13_,_9_,_1_,_18_ |
| Data         | yes      | object             | Action specifc info.                                      | _See object details_   |
| Data.Outcome | no       | enum(see examples) | Outcome of the review.                                    | _null_,_“Stands”_,     |
|              |          |                    |                                                           | _“Overturned”_         |

36

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type                                                                       | Description                                                    | Examples                 |
| -------------- | -------- | -------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------ |
| FixtureId      | yes      | number                                                                     | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                                                                            |                                                                | _10260031_,_10026403_,   |
|                |          |                                                                            |                                                                | _10471436_               |
| Id             | yes      | number                                                                     | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                                                                            | same action ID. For example, an unconfrmed action              |                          |
|                |          |                                                                            | followed by a confrmation.                                     |                          |
| PlayerStats    | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                                | _See object details_     |
| Score          | no       | Score                                                                      | Score information, referencing the current score of the        | _See object details_     |
|                |          |                                                                            | game, not the change caused by this action. Score is           |                          |
|                |          |                                                                            | provided in actions that can modify the score-line. See        |                          |
|                |          |                                                                            | Score                                                          |                          |
| Seq            | yes      | number                                                                     | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | yes      | number                                                                     | The ID for the current game period. SeeStatusId.               | _11_,_1_,_5_,_6_,_2_     |
| Ts             | yes      | number                                                                     | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                                                                            |                                                                | _1732878371314_,         |
|                |          |                                                                            |                                                                | _1732878438368_,         |
|                |          |                                                                            |                                                                | _1732878219489_,         |
|                |          |                                                                            |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples)                                                         | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean                                                               | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                                                                            | of an existing fxture for test purposes.                       |                          |

## Venue

Update to confirm if the game is being played on the home team, away team or a neutral venue. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property       | Required | Type               | Description                                                    | Examples                 |
| -------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| Action         | yes      | enum(see examples) | Action Type.                                                   | _“venue”_                |
| Clock          | no       | Clock              | Game clock. SeeClock                                           | _See object details_     |
| ConnectionId   | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data           | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.Type      | no       | enum(see examples) | Venue Type.                                                    | _“home”_,_“away”_,       |
|                |          |                    |                                                                | _“neutral”_              |
| FixtureId      | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                |          |                    |                                                                | _10260031_,_10026403_,   |
|                |          |                    |                                                                | _10471436_               |
| Id             | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                |          |                    | followed by a confrmation.                                     |                          |
| Seq            | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId       | no       | number             | The ID for the current game period. SeeStatusId.               | _2_,_4_,_7_,_9_,_12_     |
| Ts             | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                |          |                    |                                                                | _1732878371314_,         |
|                |          |                    |                                                                | _1732878438368_,         |
|                |          |                    |                                                                | _1732878219489_,         |
|                |          |                    |                                                                | _1732879081689_          |
| Type           | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                |          |                    | of an existing fxture for test purposes.                       |                          |

## Weather

Current weather at the venue - can be sent approx 30 minutes prior to start as well as during the game if the conditions change. This action is _confirmed automatically_ and will not be followed up with a confirmation message.

| Property | Required | Type               | Description          | Examples             |
| -------- | -------- | ------------------ | -------------------- | -------------------- |
| Action   | yes      | enum(see examples) | Action Type.         | _“weather”_          |
| Clock    | no       | Clock              | Game clock. SeeClock | _See object details_ |

TXODDS

37

Scores Product API documentation

3 June 2026

| Property        | Required | Type               | Description                                                    | Examples                 |
| --------------- | -------- | ------------------ | -------------------------------------------------------------- | ------------------------ |
| ConnectionId    | yes      | number             | Internal ID of the connection.                                 | _12_,_13_,_9_,_1_,_18_   |
| Data            | yes      | object             | Action specifc info.                                           | _See object details_     |
| Data.Conditions | no       | Array<enum(see     | List of weather conditions at the venue. Usually a             | _See object details_     |
|                 |          | examples)>, null   | combination of ‘day’ or ‘night’ plus one of the other values.  |                          |
| FixtureId       | yes      | number             | The normative Id of the fxture.                                | _10461989_,_10190463_,   |
|                 |          |                    |                                                                | _10260031_,_10026403_,   |
|                 |          |                    |                                                                | _10471436_               |
| Id              | yes      | number             | Action ID. Messages for the same action will have the          | _36_,_18_,_57_,_68_,_99_ |
|                 |          |                    | same action ID. For example, an unconfrmed action              |                          |
|                 |          |                    | followed by a confrmation.                                     |                          |
| Seq             | yes      | number             | Update sequence number for a fxture.                           | _52_,_60_,_74_,_40_,_48_ |
| StatusId        | yes      | number             | The ID for the current game period. SeeStatusId.               | _2_,_6_,_1_,_4_,_3_      |
| Ts              | yes      | number             | Timestamp of the update.                                       | _1732878668797_,         |
|                 |          |                    |                                                                | _1732878371314_,         |
|                 |          |                    |                                                                | _1732878438368_,         |
|                 |          |                    |                                                                | _1732878219489_,         |
|                 |          |                    |                                                                | _1732879081689_          |
| Type            | yes      | enum(see examples) | Sport Type.                                                    | _“Soccer”_               |
| VirtualFixture  | no       | null,boolean       | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_    |
|                 |          |                    | of an existing fxture for test purposes.                       |                          |

## Yellow Card

A player has received a Yellow card. This action _can be followed up with updates_ - new messages with the same action id can update this action.

| Property      | Required | Type                                                                       | Description                                                 | Examples                 |
| ------------- | -------- | -------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------ |
| Action        | yes      | enum(see examples)                                                         | Action Type.                                                | _“yellow_card”_          |
| Clock         | yes      | Clock                                                                      | Game clock. SeeClock                                        | _See object details_     |
| Confrmed      | yes      | boolean                                                                    | Action confrmation status. This indicates an action that    | _false_,_true_           |
|               |          |                                                                            | actually happened, as opposed to_possible_actions,          |                          |
|               |          |                                                                            | however the fnal confrmation is still pending and will be   |                          |
|               |          |                                                                            | sent with the same action ID, and potentially more          |                          |
|               |          |                                                                            | information related to the action. An unconfrmed event is   |                          |
|               |          |                                                                            | closer in time to the event happening, as confrmation       |                          |
|               |          |                                                                            | could be delayed by events on feld. Take this in account    |                          |
|               |          |                                                                            | when handling the events.                                   |                          |
| ConnectionId  | yes      | number                                                                     | Internal ID of the connection.                              | _12_,_13_,_9_,_1_,_18_   |
| Data          | yes      | object                                                                     | Action specifc info.                                        | _See object details_     |
| Data.PlayerId | no       | number,null                                                                | External Id of the player that received the yellow card, if | _null_,_1004569_,        |
|               |          |                                                                            | applicable.                                                 | _3240098_,_8891242_      |
| FixtureId     | yes      | number                                                                     | The normative Id of the fxture.                             | _10461989_,_10190463_,   |
|               |          |                                                                            |                                                             | _10260031_,_10026403_,   |
|               |          |                                                                            |                                                             | _10471436_               |
| Id            | yes      | number                                                                     | Action ID. Messages for the same action will have the       | _36_,_18_,_57_,_68_,_99_ |
|               |          |                                                                            | same action ID. For example, an unconfrmed action           |                          |
|               |          |                                                                            | followed by a confrmation.                                  |                          |
| Participant   | yes      | number                                                                     | The team that gets the card.                                | _1_,_2_                  |
| PlayerStats   | no       | PlayerStatsForParticipantsPlayer statistics. SeePlayerStatsForParticipants |                                                             | _See object details_     |
| Score         | no       | Score                                                                      | Score information, referencing the current score of the     | _See object details_     |
|               |          |                                                                            | game, not the change caused by this action. Score is        |                          |
|               |          |                                                                            | provided in actions that can modify the score-line. See     |                          |
|               |          |                                                                            | Score                                                       |                          |
| Seq           | yes      | number                                                                     | Update sequence number for a fxture.                        | _52_,_60_,_74_,_40_,_48_ |
| StatusId      | yes      | number                                                                     | The ID for the current game period. SeeStatusId.            | _11_,_1_,_5_,_6_,_2_     |
| Ts            | yes      | number                                                                     | Timestamp of the update.                                    | _1732878668797_,         |
|               |          |                                                                            |                                                             | _1732878371314_,         |
|               |          |                                                                            |                                                             | _1732878438368_,         |
|               |          |                                                                            |                                                             | _1732878219489_,         |
|               |          |                                                                            |                                                             | _1732879081689_          |
| Type          | yes      | enum(see examples)                                                         | Sport Type.                                                 | _“Soccer”_               |

38

TXODDS

Scores Product API documentation

3 June 2026

| Property       | Required | Type         | Description                                                    | Examples              |
| -------------- | -------- | ------------ | -------------------------------------------------------------- | --------------------- |
| VirtualFixture | no       | null,boolean | If true, the fxture is a virtual fxture, used to replay events | _null_,_false_,_true_ |
|                |          |              | of an existing fxture for test purposes.                       |                       |

TXODDS

39
