import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

const base = '/api/admin/match-settings'
const errorMessage = 'Unable to load match settings'
// Admins use the gateway session (cookie + CSRF); local ?devUser identities call the dev game directly.
const call = (path, { devUser, ...options } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, ...options })
  : gatewayRequest(path, { errorMessage, ...options })

/** @param {{ devUser?: string, signal?: AbortSignal }} identity */
export const fetchMatchSettings = identity => call(base, identity)

export const updateMatchSettings = (mode, payload, identity) =>
  call(`${base}/${mode}`, { method: 'PUT', body: payload, ...identity })
