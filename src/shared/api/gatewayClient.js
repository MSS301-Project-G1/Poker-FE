import { env } from '@/shared/config/env'
import { ApiError } from './httpClient'

const csrfExemptPaths = new Set([
  '/api/auth/register',
  '/api/auth/register/verify-otp',
  '/api/auth/register/resend-otp',
  '/api/auth/password/forgot',
  '/api/auth/password/reset',
])
const csrfErrorCodes = new Set(['AUTH_CSRF_INVALID', 'GATEWAY_CSRF_INVALID'])

let csrfToken = null
let csrfPromise = null
let refreshPromise = null

const endpoint = path => `${env.apiBaseUrl}${path}`

async function readPayload(response) {
  return response.json().catch(() => null)
}

function responseError(response, payload, fallbackMessage) {
  return new ApiError(payload?.message || `${fallbackMessage} (${response.status}).`, {
    status: response.status,
    code: payload?.code,
    requestId: payload?.requestId || response.headers.get('X-Request-Id'),
    payload,
  })
}

export function clearGatewaySession() {
  csrfToken = null
}

export async function loadCsrf(force = false) {
  if (force) csrfToken = null
  if (csrfToken) return csrfToken
  if (!csrfPromise) {
    csrfPromise = (async () => {
      const response = await fetch(endpoint('/api/auth/csrf'), {
        credentials: 'include',
        cache: 'no-store',
      })
      const payload = await readPayload(response)
      if (!response.ok) throw responseError(response, payload, 'Unable to initialize security')
      if (!payload?.result?.token) throw new ApiError('The server did not return a CSRF token.', { payload })
      csrfToken = payload.result.token
      return csrfToken
    })().finally(() => { csrfPromise = null })
  }
  return csrfPromise
}

function needsCsrf(method, path) {
  return !['GET', 'HEAD', 'OPTIONS'].includes(method) && !csrfExemptPaths.has(path.split('?')[0])
}

async function send(path, {
  method = 'GET',
  body,
  signal,
  headers = {},
  errorMessage = 'Request failed',
  retryCsrf = true,
} = {}) {
  const upperMethod = method.toUpperCase()
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const requestHeaders = {
    ...(body !== undefined && !isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(needsCsrf(upperMethod, path) ? { 'X-XSRF-TOKEN': await loadCsrf() } : {}),
    ...headers,
  }
  const response = await fetch(endpoint(path), {
    method: upperMethod,
    credentials: 'include',
    signal,
    headers: requestHeaders,
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  })
  const payload = await readPayload(response)
  if (response.ok) return payload

  const error = responseError(response, payload, errorMessage)
  if (retryCsrf && csrfErrorCodes.has(error.code)) {
    await loadCsrf(true)
    return send(path, { method, body, signal, headers, errorMessage, retryCsrf: false })
  }
  throw error
}

async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = send('/api/auth/refresh', {
      method: 'POST',
      errorMessage: 'Unable to refresh the session',
    }).finally(() => { refreshPromise = null })
  }
  return refreshPromise
}

/**
 * Cookie-authenticated gateway request. Returns the complete HTTP payload so each
 * feature adapter can explicitly read its own `result`, `data`, or raw contract.
 */
export async function gatewayRequest(path, { auth = true, ...options } = {}) {
  try {
    return await send(path, options)
  } catch (error) {
    if (!auth || error.status !== 401 || path.split('?')[0] === '/api/auth/refresh') throw error
    await refreshSession()
    return send(path, options)
  }
}
