/**
 * Reference implementation — Impact Score calculation and Flash Card
 * classification.
 *
 * Redesigned after a full read of the actual TxODDS soccer feed spec (v1.1),
 * not the earlier summary pass. See docs/03-event-pipeline-and-flash-cards.md
 * §2 for the full reasoning behind every change here.
 *
 * "Impact Score" is the per-event significance score: it runs once when a
 * TxLINE update arrives and decides whether that update is significant
 * enough to become a Flash Card. It is internal — never rendered as a raw
 * number to users.
 *
 * What changed from the original pass, in one sentence each:
 * - VAR now weights by review type (a goal review isn't a corner review).
 * - Penalties are a real two-stage lifecycle (awarded, then resolved), same
 *   shape as VAR.
 * - Shots only ever become a card on a Woodwork outcome — everything else
 *   feeds the ambient possession signal, or the feed floods.
 * - A narrative bonus rewards a player's brace/hat-trick using the
 *   per-player stats the feed already attaches to every goal.
 * - The knockout multiplier is now three mutually-exclusive tiers (regular
 *   time / extra time / penalties) instead of one flat bump, since these
 *   describe the same dimension (match stakes), not independent facts.
 * - The final-15-minutes multiplier is scoped to regular time only, since
 *   extra-time periods are already covered by their own tier and would
 *   otherwise double-count against it.
 */

export type FlashType =
  | "goal"
  | "card"
  | "corner"
  | "oddsSwing"
  | "anticipation"
  | "varReview"
  | "varResolved"
  | "penaltyAwarded"
  | "penaltyResolved"
  | "additionalTime"
  | "shot"
  | "injury"
  | "comment"
  | "weather"
  | "atmosphere"
  | "possessionPressure"

export const WEIGHTS = {
  goal: 60,
  ownGoal: 60, // identical weight — match impact is the same; only card copy tone changes
  redCard: 45,
  penaltyAwarded: 20,
  penaltyScored: 55,
  penaltyMissed: 30,
  penaltyRetaken: 15,
  phaseChange: 15,
  cornerFinal10: 12,
  woodworkShot: 18,
  oddsSwingOver10: 30,
  oddsSwingOver20: 50,
  underdogLeadOrComeback: 25,
  injuryNotReturning: 12, // merge with the resulting substitution via FollowsAction when one follows
  injuryOther: 5,
  additionalTimeAnnounced: 8,
  sustainedHighDangerPossession: 5, // per interval, capped — ambient only, never its own card
} as const

/**
 * VAR weight now depends on what's actually being reviewed — a review that
 * could disallow a goal is not the same event as a review of a corner, and
 * Data.Type on the opening `var` action tells you which one you're looking
 * at. Replaces the old flat +20/+40/+15.
 */
export const VAR_WEIGHTS: Record<
  | "Goal"
  | "Penalty"
  | "RedCard"
  | "SecondYellowCard"
  | "CornerKick"
  | "MistakenIdentity"
  | "Other",
  { opened: number; stands: number; overturned: number }
> = {
  Goal: { opened: 25, stands: 15, overturned: 55 },
  Penalty: { opened: 25, stands: 15, overturned: 50 },
  RedCard: { opened: 22, stands: 15, overturned: 45 },
  SecondYellowCard: { opened: 20, stands: 15, overturned: 40 },
  CornerKick: { opened: 10, stands: 8, overturned: 20 },
  MistakenIdentity: { opened: 8, stands: 8, overturned: 20 },
  Other: { opened: 15, stands: 12, overturned: 25 },
}

/** Uses the running per-player goal count already visible on every goal message. */
export const NARRATIVE_BONUS = {
  brace: 15, // same player's 2nd goal this match
  hatTrick: 30, // same player's 3rd+ goal this match
} as const

/** Mutually exclusive — a match is in exactly one of these states at a time. */
export const MATCH_STAKES_MULTIPLIERS = {
  knockoutRegularTime: 1.2,
  knockoutExtraTime: 1.35,
  penaltyShootout: 1.5,
} as const

export const MULTIPLIERS = {
  // H1/H2 only. Deliberately excluded from extra time — ET periods are
  // ~15 minutes by rule (read GameType off the `standby` action rather than
  // hardcoding 45, in case a competition ever differs), which would make
  // "final 15" true for nearly the whole period and double-count against
  // the extra-time tier above.
  final15MinutesRegularTime: 1.25,
  confirmed: 1.0,
  unconfirmed: 0.4,
} as const

export const CARD_THRESHOLD = 45
export const ANTICIPATION_CAP = 20

export type MatchStakesState =
  "none" | "knockoutRegularTime" | "knockoutExtraTime" | "penaltyShootout"

export interface MatchContext {
  minute: number
  periodLengthMinutes: number // from GameType, not hardcoded
  isFinalPhaseOfPeriod: boolean // only meaningful when matchStakes is "none" or "knockoutRegularTime"
  matchStakes: MatchStakesState
}

export interface ScoreInputs {
  base: number
  confirmed: boolean
  context: MatchContext
}

export function calculateImpactScore({
  base,
  confirmed,
  context,
}: ScoreInputs): number {
  let score = base

  if (context.matchStakes === "knockoutRegularTime") {
    score *= MATCH_STAKES_MULTIPLIERS.knockoutRegularTime
  } else if (context.matchStakes === "knockoutExtraTime") {
    score *= MATCH_STAKES_MULTIPLIERS.knockoutExtraTime
  } else if (context.matchStakes === "penaltyShootout") {
    score *= MATCH_STAKES_MULTIPLIERS.penaltyShootout
  }

  if (
    context.isFinalPhaseOfPeriod &&
    (context.matchStakes === "none" ||
      context.matchStakes === "knockoutRegularTime")
  ) {
    score *= MULTIPLIERS.final15MinutesRegularTime
  }

  score *= confirmed ? MULTIPLIERS.confirmed : MULTIPLIERS.unconfirmed

  if (!confirmed) {
    score = Math.min(score, ANTICIPATION_CAP)
  }

  return Math.round(score)
}

/** Call after computing a goal's base score, using PlayerStats' running tally for this match. */
export function narrativeBonusForGoalCount(
  goalCountThisMatchForPlayer: number
): number {
  if (goalCountThisMatchForPlayer >= 3) return NARRATIVE_BONUS.hatTrick
  if (goalCountThisMatchForPlayer === 2) return NARRATIVE_BONUS.brace
  return 0
}

/** Call with Data.Type from the opening `var` action, and the outcome once resolved. */
export function varWeight(
  reviewType: keyof typeof VAR_WEIGHTS,
  outcome?: "Stands" | "Overturned"
): number {
  const weights = VAR_WEIGHTS[reviewType] ?? VAR_WEIGHTS.Other
  if (outcome === "Overturned") return weights.overturned
  if (outcome === "Stands") return weights.stands
  return weights.opened
}

export function baseWeightForAction(
  action: string,
  data: { minutes?: number; outcome?: string; goalType?: string } = {}
): number {
  switch (action) {
    case "goal":
      return data.goalType === "Own" ? WEIGHTS.ownGoal : WEIGHTS.goal
    case "red_card":
      return WEIGHTS.redCard
    case "penalty":
      return WEIGHTS.penaltyAwarded
    case "penalty_outcome":
      if (data.outcome === "Scored") return WEIGHTS.penaltyScored
      if (data.outcome === "Missed") return WEIGHTS.penaltyMissed
      if (data.outcome === "Retake") return WEIGHTS.penaltyRetaken
      return 0
    case "corner":
      return WEIGHTS.cornerFinal10 // caller should only invoke this in the final-10 window
    case "shot":
      return data.outcome === "Woodwork" ? WEIGHTS.woodworkShot : 0 // every other outcome: ambient signal only, never a card
    case "injury":
      return data.outcome === "NotReturning"
        ? WEIGHTS.injuryNotReturning
        : WEIGHTS.injuryOther
    case "additional_time":
      return (data.minutes ?? 0) >= 3 ? WEIGHTS.additionalTimeAnnounced : 0
    default:
      return 0
  }
}

/**
 * Comment-sourced cards deserve individual judgment, not one flat number —
 * severity: warning covers everything from a mundane stoppage to a coach's
 * red card. This returns a reasonable default; adjust per actual content at
 * classification time. severity: info should never reach this function;
 * severity: action_invalid routes to manual review, never to fan copy.
 */
export function commentWeight(
  severity: "info" | "warning" | "action_invalid"
): number {
  return severity === "warning" ? 20 : 0
}

export function classifyFlashType(
  action: string,
  confirmed: boolean
): FlashType | null {
  if (action === "possible") return "anticipation" // ambient tension, not a preview of a specific outcome
  if (action === "var") return "varReview"
  if (action === "var_end") return "varResolved"
  if (action === "penalty") return "penaltyAwarded"
  if (action === "penalty_outcome") return "penaltyResolved"
  if (action === "additional_time") return "additionalTime"
  if (action === "weather") return "weather"
  if (["venue", "jersey", "lineups", "lineup"].includes(action))
    return "atmosphere"
  if (action === "comment") return "comment" // caller must have already filtered to severity: warning

  if (!confirmed) return null

  switch (action) {
    case "goal":
      return "goal"
    case "red_card":
    case "yellow_card":
      return "card"
    case "corner":
      return "corner"
    case "shot":
      return "shot" // caller must have already filtered to Woodwork only
    case "injury":
      return "injury"
    default:
      return null
  }
}

export function oddsSwingWeight(deltaPoints: number): number {
  const magnitude = Math.abs(deltaPoints)
  if (magnitude > 20) return WEIGHTS.oddsSwingOver20
  if (magnitude > 10) return WEIGHTS.oddsSwingOver10
  return 0
}
