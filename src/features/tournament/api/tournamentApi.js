import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

// Signed-in players reach competition-service through the gateway session cookie; local ?devUser identities
// call the dev service directly through the Vite proxy (like game-table's gameApi).
const call = (path, errorMessage, { devUser, signal, method, body, auth } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, signal, method, body })
  : gatewayRequest(path, { errorMessage, signal, method, body, auth })

const tournament = id => `/api/tournaments/${encodeURIComponent(id)}`

/**
 * Every function takes identity = { devUser?, signal? } last. Lists and details are public on the gateway,
 * so no session refresh is attempted. past=false: scheduled and running, soonest first; true: ended, latest first.
 */
export const fetchTournaments = (past, page, size, identity) =>
  call(`/api/tournaments?past=${past}&page=${page}&size=${size}`, 'Unable to load tournaments', { ...identity, auth: false })

/** Detail with prizes, entries and the bracket tables (final first). */
export const fetchTournament = (id, identity) =>
  call(tournament(id), 'Unable to load the tournament', { ...identity, auth: false })

/** OPEN tournaments: takes the entry fee once; repeating returns the same entry. */
export const registerTournament = (id, identity) =>
  call(`${tournament(id)}/register`, 'Unable to register', { ...identity, method: 'POST' })

/** ELITE invitees accept before confirmBy; repeating is a no-op. */
export const confirmTournament = (id, identity) =>
  call(`${tournament(id)}/confirm`, 'Unable to accept the invitation', { ...identity, method: 'POST' })
