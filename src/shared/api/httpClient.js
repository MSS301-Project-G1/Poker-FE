// Shared fetch wrapper: JSON bodies, auth headers and consistent errors for every feature API.
// Feature code calls its own api/*.js functions, which call request(); components never call fetch directly.

export class ApiError extends Error {
  constructor(message, { status, code } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

/**
 * @param {string} url
 * @param {object} [options]
 * @param {string} [options.method]
 * @param {unknown} [options.body] serialized as JSON
 * @param {AbortSignal} [options.signal]
 * @param {string|null} [options.accessToken] sent as a Bearer token
 * @param {string|null} [options.devUser] local-development identity header
 * @param {string} [options.errorMessage] shown when the server returns no message
 */
export async function request(url, { method = 'GET', body, signal, accessToken, devUser, errorMessage = 'Request failed' } = {}) {
  const response = await fetch(url, {
    method, signal,
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(devUser ? { 'X-Dev-User': devUser } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(data?.message || `${errorMessage} (${response.status}).`, { status: response.status, code: data?.code })
  return data
}
