import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

const base = '/api/admin/tournaments'
// Admins use the gateway session (cookie + CSRF); local ?devUser identities call the dev competition-service directly.
const call = (path, errorMessage, { devUser, signal, method, body, auth } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, signal, method, body })
  : gatewayRequest(path, { errorMessage, signal, method, body, auth })

/** Every function takes identity = { devUser?, signal? } last. past=false: scheduled and running; true: ended. */
export const fetchTournaments = (past, page, size, identity) =>
  call(`/api/tournaments?past=${past}&page=${page}&size=${size}`, 'Unable to load tournaments', { ...identity, auth: false })

/** { name, type, startAt, entryFee, slots, rewardCoins, rewardProductId } → the SCHEDULED tournament. */
export const createTournament = (tournament, identity) =>
  call(base, 'Unable to create the tournament', { ...identity, method: 'POST', body: tournament })

/** Seats the players holding a place now instead of waiting for startAt. */
export const startTournament = (id, identity) =>
  call(`${base}/${id}/start`, 'Unable to start the tournament', { ...identity, method: 'POST' })

/** Before the start only; every entry fee is refunded. */
export const cancelTournament = (id, identity) =>
  call(`${base}/${id}/cancel`, 'Unable to cancel the tournament', { ...identity, method: 'POST' })

/** Shop products that can be the champion's skin: [{ id, name, categoryName, tier }]. */
export const fetchProducts = identity =>
  call('/api/shop/products?page=0&size=100', 'Unable to load shop products', { ...identity, auth: false })
    .then(payload => payload?.data?.content || [])
