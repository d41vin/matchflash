export function txlineDevnetActivationPayload(body: string) {
  if (body.length === 0) return null

  try {
    return JSON.parse(body) as unknown
  } catch {
    return body
  }
}
