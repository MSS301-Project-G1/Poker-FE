import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

const base = `${env.gameApiBaseUrl}/api/admin/match-settings`
const errorMessage = 'Unable to load match settings'

/** @param {{ accessToken?: string, devUser?: string, signal?: AbortSignal }} identity */
export const fetchMatchSettings = identity => request(base, { errorMessage, ...identity })

export const updateMatchSettings = (mode, payload, identity) =>
  request(`${base}/${mode}`, { method: 'PUT', body: payload, errorMessage, ...identity })
