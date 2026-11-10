import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

// Signed-in players reach ranking-service through the gateway session cookie; local ?devUser identities
// call the dev service directly through the Vite proxy (like game-table's gameApi).
const call = (path, errorMessage, { devUser, signal, method, body, auth } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, signal, method, body })
  : gatewayRequest(path, { errorMessage, signal, method, body, auth })

/** Every function takes identity = { devUser?, signal? } last. */
export const fetchCurrentSeason = identity =>
  call('/api/seasons/current', 'Unable to load the season', { ...identity, auth: false })

/** [{ tier, rewardType: COIN | PRODUCT, amount, productId }] */
export const fetchTierRewards = (seasonId, identity) =>
  call(`/api/seasons/${seasonId}/rewards`, 'Unable to load the season rewards', { ...identity, auth: false })

/** Own standing in the active season; position is null before the first ranked match. */
export const fetchMyStanding = identity => call('/api/ranking/me', 'Unable to load your standing', identity)

/** Ended seasons where the player reached a rewarded tier: [{ seasonId, seasonName, endAt, finalTier, rewards, claimed, claimedAt }] */
export const fetchMySeasonRewards = identity => call('/api/seasons/rewards/me', 'Unable to load your rewards', identity)

/** Claims every reward up to the final tier; repeating returns the same claim. */
export const claimSeasonRewards = (seasonId, identity) =>
  call(`/api/seasons/${seasonId}/rewards/claim`, 'Unable to claim the rewards', { ...identity, method: 'POST' })
