import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'
import { gatewayRequest } from '@/shared/api/gatewayClient'

const errorMessage = 'Unable to load the game'
const call = (path, options) => request(`${env.gameApiBaseUrl}${path}`, { errorMessage, ...options })

/** @param {{ accessToken?: string, devUser?: string, signal?: AbortSignal }} identity */
const gameRequest = (path, identity) => env.gameDevMode && identity?.devUser
  ? call(path, identity)
  : gatewayRequest(path, { signal: identity?.signal, errorMessage })

export const fetchActiveTable = identity => gameRequest('/api/game/me/active-table', identity)

export const fetchTable = (tableId, identity) => gameRequest(`/api/game/tables/${tableId}`, identity)

// Local development only: creates a table with the given number of human and bot seats.
export const createDevTable = ({ humans, bots }) => call(`/dev/tables?humans=${humans}&bots=${bots}`, { method: 'POST' })

export function gameSocketUrl() {
  const url = new URL(env.gameSocketUrl, window.location.href)
  url.protocol = url.protocol === 'https:' ? 'wss:' : url.protocol === 'http:' ? 'ws:' : url.protocol
  return url.href
}
