const base = import.meta.env.VITE_RANKING_API_BASE_URL || ''

export async function rankingRequest(path, { signal, accessToken, devUser } = {}) {
  const response = await fetch(`${base}${path}`, {
    signal,
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(devUser ? { 'X-User-Id': devUser } : {}),
    },
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.message || `Unable to load the leaderboard (${response.status}).`)
    error.code = data?.code
    error.status = response.status
    throw error
  }
  return data
}
