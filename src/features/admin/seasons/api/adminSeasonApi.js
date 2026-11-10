import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

const base = '/api/admin/seasons'
// Admins use the gateway session (cookie + CSRF); local ?devUser identities call the dev ranking-service directly.
const call = (path, errorMessage, { devUser, signal, method, body, auth } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, signal, method, body })
  : gatewayRequest(path, { errorMessage, signal, method, body, auth })

/** Every function takes identity = { devUser?, signal? } last. All seasons, newest first, with their tier rewards. */
export const fetchSeasons = identity => call(base, 'Unable to load seasons', identity)

/** { name, startAt, endAt, resetPercent, rewards[] } → the new UPCOMING season. */
export const createSeason = (season, identity) =>
  call(base, 'Unable to create the season', { ...identity, method: 'POST', body: season })

/** Replaces every tier reward; refused once the season has ended. */
export const updateSeasonRewards = (seasonId, rewards, identity) =>
  call(`${base}/${seasonId}/rewards`, 'Unable to save the rewards', { ...identity, method: 'PUT', body: { rewards } })

/** Ends the active season now and starts the next UPCOMING one. */
export const closeSeason = identity => call(`${base}/close`, 'Unable to close the season', { ...identity, method: 'POST' })

/** Shop products that can be given as skin rewards: [{ id, name, categoryName, tier }]. */
export const fetchProducts = identity =>
  call('/api/shop/products?page=0&size=100', 'Unable to load shop products', { ...identity, auth: false })
    .then(payload => payload?.data?.content || [])
