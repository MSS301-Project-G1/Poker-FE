import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

// Signed-in players reach ranking-service through the gateway session cookie; local ?devUser identities
// call the dev service directly through the Vite proxy (like game-table's gameApi).
const call = (path, errorMessage, { devUser, signal, method, body, auth } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, signal, method, body })
  : gatewayRequest(path, { errorMessage, signal, method, body, auth })

/** @param {{ devUser?: string, signal?: AbortSignal }} identity */
export const fetchCurrentSeason = identity =>
  call('/api/seasons/current', 'Unable to load the season', { ...identity, auth: false })

/** Public on the gateway, so no session refresh is attempted. */
export const fetchLeaderboard = (page, size, identity) =>
  call(`/api/ranking/leaderboard?page=${page}&size=${size}`, 'Unable to load the leaderboard', { ...identity, auth: false })

/** Own standing; position is null before the first ranked match of the season. */
export const fetchMyStanding = identity => call('/api/ranking/me', 'Unable to load your standing', identity)

/** The player and their friends: [{ rank, position, accountId, elo, tier, winStreak, matchesPlayed, you }]. */
export const fetchFriendsLeaderboard = identity => call('/api/ranking/friends', 'Unable to load your friends', identity)
