import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

const errorMessage = 'Unable to load the leaderboard'
const call = (path, identity) => request(`${env.gameApiBaseUrl}${path}`, { errorMessage, ...identity })

/** @param {{ accessToken?: string, devUser?: string, signal?: AbortSignal }} identity */
export const fetchCurrentSeason = identity => call('/api/seasons/current', identity)

export const fetchLeaderboard = (page, size, identity) =>
  call(`/api/ranking/leaderboard?page=${page}&size=${size}`, identity)

/** Own standing; position is null before the first ranked match of the season. */
export const fetchMyStanding = identity => call('/api/ranking/me', identity)
