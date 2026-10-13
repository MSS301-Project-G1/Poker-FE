const base = import.meta.env.VITE_COMPETITION_API_BASE_URL || ''

export async function roomRequest(path, { method = 'GET', body, signal, accessToken, devUser } = {}) {
  const response = await fetch(`${base}${path}`, {
    method, signal,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(devUser ? { 'X-User-Id': devUser } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const text = await response.text()
  const data = text ? (() => { try { return JSON.parse(text) } catch { return null } })() : null
  if (!response.ok) {
    const error = new Error(data?.message || `Room request failed (${response.status}).`)
    error.code = data?.code
    error.status = response.status
    throw error
  }
  return data
}

/** Game table URL; local identities carry over so the game feature can act as the same player. */
export function tableUrl(tableId, devUser) {
  return `/table/${tableId}${devUser ? `?devUser=${devUser}` : ''}`
}
