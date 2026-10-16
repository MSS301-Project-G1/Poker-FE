import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

const errorMessage = 'Room request failed'
const call = (path, options) => request(`${env.gameApiBaseUrl}/api/rooms${path}`, { errorMessage, ...options })
const room = code => `/${encodeURIComponent(code)}`

/** Every function takes identity = { accessToken?, devUser?, signal? } last. Actions return the updated room. */
export const fetchMyRoom = identity => call('/me', identity)

export const fetchPublicRooms = (page, size, identity) => call(`?page=${page}&size=${size}`, identity)

export const createRoom = (settings, identity) => call('', { method: 'POST', body: settings, ...identity })

export const fetchRoom = (code, identity) => call(room(code), identity)

export const joinRoom = (code, password, identity) =>
  call(`${room(code)}/join`, { method: 'POST', body: { password }, ...identity })

export const leaveRoom = (code, identity) => call(`${room(code)}/leave`, { method: 'POST', ...identity })

export const setReady = (code, ready, identity) => call(`${room(code)}/ready`, { method: 'PUT', body: { ready }, ...identity })

export const kickMember = (code, accountId, identity) =>
  call(`${room(code)}/members/${accountId}`, { method: 'DELETE', ...identity })

export const transferOwner = (code, accountId, identity) =>
  call(`${room(code)}/owner`, { method: 'PUT', body: { accountId }, ...identity })

export const inviteFriend = (code, accountId, identity) =>
  call(`${room(code)}/invitations`, { method: 'POST', body: { accountId }, ...identity })

export const startRoom = (code, identity) => call(`${room(code)}/start`, { method: 'POST', ...identity })
