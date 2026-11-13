import { gatewayRequest } from '@/shared/api/gatewayClient'

const resultOf = payload => {
  if (payload?.result === undefined) throw new Error('The server returned an invalid response.')
  return payload.result
}

export const fetchAdminUsers = ({ keyword = '', banned = '', page = 0, signal } = {}) => {
  const query = new URLSearchParams({ keyword, page: String(page), size: '20' })
  if (banned !== '') query.set('banned', banned)
  return gatewayRequest(`/api/admin/users?${query}`, { signal }).then(resultOf)
}

export const fetchAdminUser = (accountId, signal) => gatewayRequest(`/api/admin/users/${accountId}`, { signal }).then(resultOf)

export const fetchBanHistory = (accountId, page, signal) => gatewayRequest(
  `/api/admin/users/${accountId}/bans?page=${page}&size=20`, { signal },
).then(resultOf)

export const banUser = (accountId, body) => gatewayRequest(`/api/admin/users/${accountId}/ban`, { method: 'POST', body }).then(resultOf)
export const unbanUser = (accountId, body) => gatewayRequest(`/api/admin/users/${accountId}/unban`, { method: 'POST', body }).then(resultOf)

/** Account, profile, avatar, ban and restrictions; never credentials. */
export const fetchAdminUserDetails = (accountId, signal) => gatewayRequest(
  `/api/admin/users/${accountId}/details`, { signal },
).then(resultOf)

/** body: { action, reason }; returns the updated details. */
export const moderateUser = (accountId, body) => gatewayRequest(
  `/api/admin/users/${accountId}/moderation`, { method: 'POST', body },
).then(resultOf)

export const fetchModerationHistory = (accountId, page, signal) => gatewayRequest(
  `/api/admin/users/${accountId}/moderation?page=${page}&size=20`, { signal },
).then(resultOf)

// ranking-service and game-service answer without the auth envelope.
export const fetchPlayerStanding = (accountId, signal) => gatewayRequest(
  `/api/ranking/players/${accountId}`, { signal, errorMessage: 'Unable to load the ranking' },
)

export const fetchRecentMatches = (accountId, signal) => gatewayRequest(
  `/api/game/matches?accountId=${accountId}&page=0&size=5`, { signal, errorMessage: 'Unable to load the matches' },
)

/** ranking-service admin route; sets the active-season Elo and returns the new standing. */
export const adjustPlayerElo = (accountId, body) => gatewayRequest(
  `/api/admin/seasons/players/${accountId}/elo`, { method: 'PUT', body, errorMessage: 'Unable to change the Elo' },
)

export const fetchEloAdjustments = (accountId, page, signal) => gatewayRequest(
  `/api/admin/seasons/players/${accountId}/elo-adjustments?page=${page}&size=20`, { signal, errorMessage: 'Unable to load the Elo history' },
)
