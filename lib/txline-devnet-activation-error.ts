type UpstreamErrorPayload = {
  error?: unknown
  message?: unknown
}

export function txlineDevnetActivationError(
  status: number,
  payload: unknown
) {
  const candidate =
    typeof payload === "object" && payload !== null
      ? (payload as UpstreamErrorPayload)
      : null
  const detail =
    typeof candidate?.error === "string"
      ? candidate.error
      : typeof candidate?.message === "string"
        ? candidate.message
        : null
  const suffix = detail ? `: ${detail.slice(0, 300)}` : ""

  return `TxLINE Devnet activation failed upstream (HTTP ${status})${suffix}`
}
