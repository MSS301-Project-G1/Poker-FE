const base = import.meta.env.VITE_GAME_API_BASE_URL || ''

export async function gameRequest(path, { method = 'GET', body, signal, accessToken, devUser } = {}) {
  const response = await fetch(`${base}${path}`, {
    method, signal,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(devUser ? { 'X-Dev-User': devUser } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.message || `Unable to load the game (${response.status}).`)
    error.code = data?.code
    error.status = response.status
    throw error
  }
  return data
}

export function gameSocketUrl() {
  const url = new URL(import.meta.env.VITE_GAME_WS_URL || '/ws/game', window.location.href)
  url.protocol = url.protocol === 'https:' ? 'wss:' : url.protocol === 'http:' ? 'ws:' : url.protocol
  return url.href
}
