// Shared fetch wrapper: JSON bodies, auth headers and consistent errors for every feature API.
// Feature code calls its own api/*.js functions, which call request(); components never call fetch directly.

export class ApiError extends Error {
  constructor(message, { status, code, requestId, payload } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.requestId = requestId
    this.payload = payload
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
 * @param {Record<string, string>} [options.headers] custom headers
 * @param {string} [options.errorMessage] shown when the server returns no message
 */
export async function request(url, {
  method = 'GET',
  body,
  signal,
  accessToken,
  devUser,
  headers = {},
  errorMessage = 'Request failed',
} = {}) {
  const token = accessToken || (typeof window !== 'undefined' ? window.localStorage?.getItem('access_token') : null)
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData

  const requestHeaders = {
    ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(devUser ? { 'X-Dev-User': devUser } : {}),
    ...headers,
  }

  const response = await fetch(url, {
    method,
    signal,
    headers: requestHeaders,
    credentials: 'include',
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(data?.message || `${errorMessage} (${response.status}).`, { status: response.status, code: data?.code })
  return data
}
