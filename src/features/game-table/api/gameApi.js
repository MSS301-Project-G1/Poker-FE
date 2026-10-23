import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

const errorMessage = 'Unable to load the game'
const direct = (path, options) => request(`${env.gameApiBaseUrl}${path}`, { errorMessage, ...options })
// Signed-in players reach the game through the gateway session cookie; local ?devUser identities call the dev game directly.
const call = (path, { devUser, signal, method } = {}) => devUser
  ? direct(path, { devUser, signal, method })
  : gatewayRequest(path, { errorMessage, signal, method })

/** @param {{ devUser?: string, signal?: AbortSignal }} identity */
export const fetchActiveTable = identity => call('/api/game/me/active-table', identity)

export const fetchTable = (tableId, identity) => call(`/api/game/tables/${tableId}`, identity)

// Normal mode only: forfeits the rest of the match so the player can queue again.
export const leaveTable = (tableId, identity) => call(`/api/game/tables/${tableId}/leave`, { ...identity, method: 'POST' })

// The question asked before leaveTable, for useConfirm().
export const leaveMatchPrompt = {
  title: 'Rời ván?', message: 'Bạn sẽ bị xử thua và không thể quay lại bàn này.',
  confirmLabel: 'Rời ván', cancelLabel: 'Ở lại', icon: 'logout', danger: true,
}

// Local development only: creates a table with the given number of human and bot seats.
export const createDevTable = ({ humans, bots }) => direct(`/dev/tables?humans=${humans}&bots=${bots}`, { method: 'POST' })

export function gameSocketUrl() {
  const url = new URL(env.gameSocketUrl, window.location.href)
  url.protocol = url.protocol === 'https:' ? 'wss:' : url.protocol === 'http:' ? 'ws:' : url.protocol
  return url.href
}
