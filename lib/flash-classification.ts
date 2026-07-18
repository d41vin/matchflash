import type { ReliabilityState } from "./fixture-reconciliation"

export type CoreFlashType =
  "goal" | "card" | "corner" | "varReview" | "varResolved" | "phaseChange"

export type CoreFlashCard = {
  fixtureId: number
  actionId: number
  type: CoreFlashType
  title: string
  impactScore: number
  participant?: 1 | 2
}

const FINAL_STATUS_IDS = [5, 10, 13, 15, 16, 17]

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function objectAt(value: JsonObject | undefined, key: string) {
  const candidate = value?.[key]
  return isObject(candidate) ? candidate : undefined
}

function numberAt(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function stringAt(value: unknown) {
  return typeof value === "string" && value.length > 0 ? value : undefined
}

function booleanAt(value: unknown) {
  return typeof value === "boolean" ? value : undefined
}

function participantAt(value: unknown): 1 | 2 | undefined {
  const participant = numberAt(value)
  return participant === 1 || participant === 2 ? participant : undefined
}

type SourceAction = {
  action: string
  actionId: number
  confirmed: boolean
  statusId?: number
  participant?: 1 | 2
}

function sourceAction(raw: unknown): SourceAction | null {
  if (!isObject(raw)) return null

  const update = objectAt(raw, "Update")
  if (!update) return null

  const action = stringAt(update.Action)?.toLowerCase()
  if (!action) return null

  const data = objectAt(update, "Data")
  if (action === "action_amend") {
    const amendedAction = stringAt(data?.Action)?.toLowerCase()
    const amendedActionId = numberAt(data?.Id)
    const replacement = objectAt(data, "New")
    if (!amendedAction || amendedActionId === undefined || !replacement) {
      return null
    }

    return {
      action: amendedAction,
      actionId: amendedActionId,
      // TxLINE amendments are final source corrections; Data.New replaces the
      // action payload and does not repeat the original Confirmed field.
      confirmed: true,
      statusId: numberAt(replacement.StatusId),
      participant: participantAt(data?.Participant),
    }
  }

  const actionId = numberAt(update.Id)
  if (actionId === undefined) return null

  return {
    action,
    actionId,
    confirmed: booleanAt(update.Confirmed) === true,
    statusId: numberAt(update.StatusId) ?? numberAt(data?.StatusId),
    participant: participantAt(update.Participant),
  }
}

function canCreateCard(type: CoreFlashType, reliability: ReliabilityState) {
  if (reliability.dataSuspended) return false
  if (type === "corner") {
    return (
      reliability.cornersReliable &&
      reliability.periodSuspectSinceAdjustment !== true
    )
  }
  if (type === "card") {
    return (
      reliability.cardsReliable &&
      reliability.periodSuspectSinceAdjustment !== true
    )
  }
  return true
}

function phaseTitle(action: string, statusId: number | undefined) {
  if (action === "kickoff") return "Kickoff"
  if (action === "halftime_finalised") return "Half time"
  if (FINAL_STATUS_IDS.includes(statusId ?? -1)) {
    return "Full time"
  }
  return null
}

/**
 * Converts only confirmed, reconciled core actions to permanent Flash Cards.
 * Possible and unconfirmed source signals deliberately return null: they may
 * power a later transient presentation, but never the fixture record.
 */
export function classifyCoreFlashCard(
  fixtureId: number,
  raw: unknown,
  reliability: ReliabilityState,
  ignoreReliability = false
): CoreFlashCard | null {
  const source = sourceAction(raw)
  if (!source?.confirmed) return null

  let type: CoreFlashType | null = null
  let title: string | null = null
  let impactScore: number | null = null
  if (["yellow_card", "red_card"].includes(source.action)) {
    type = "card"
    title = source.action === "red_card" ? "Red card" : "Yellow card"
    impactScore = source.action === "red_card" ? 45 : 20
  } else if (source.action === "corner") {
    type = "corner"
    title = "Corner"
    impactScore = 12
  } else if (source.action === "var") {
    type = "varReview"
    title = "VAR review"
    impactScore = 25
  } else if (source.action === "var_end") {
    type = "varResolved"
    title = "VAR decision"
    impactScore = 15
  } else if (
    source.action === "kickoff" ||
    source.action === "halftime_finalised" ||
    (source.action === "status" &&
      FINAL_STATUS_IDS.includes(source.statusId ?? -1))
  ) {
    type = "phaseChange"
    title = phaseTitle(source.action, source.statusId)
    impactScore = 15
  }

  if (
    !type ||
    !title ||
    impactScore === null ||
    (!ignoreReliability && !canCreateCard(type, reliability))
  ) {
    return null
  }

  return {
    fixtureId,
    actionId: source.actionId,
    type,
    title,
    impactScore,
    ...(source.participant !== undefined
      ? { participant: source.participant }
      : {}),
  }
}

/** Returns the original action identified by an explicit source discard. */
export function discardedActionId(raw: unknown): number | null {
  if (!isObject(raw)) return null
  const update = objectAt(raw, "Update")
  if (stringAt(update?.Action)?.toLowerCase() !== "action_discarded") {
    return null
  }
  return numberAt(update?.Id) ?? null
}

/** Returns the original action identified by an explicit source amendment. */
export function amendedActionId(raw: unknown): number | null {
  if (!isObject(raw)) return null
  const update = objectAt(raw, "Update")
  if (stringAt(update?.Action)?.toLowerCase() !== "action_amend") {
    return null
  }
  return numberAt(objectAt(update, "Data")?.Id) ?? null
}
