import { gatewayRequest } from '@/shared/api/gatewayClient'
import { request } from '@/shared/api/httpClient'
import { env } from '@/shared/config/env'

// Signed-in players reach competition-service through the gateway session cookie; local ?devUser identities
// call the dev service directly through the Vite proxy (like game-table's gameApi).
const call = (path, errorMessage, { devUser, signal, method, body, auth } = {}) => devUser
  ? request(`${env.gameApiBaseUrl}${path}`, { errorMessage, devUser, signal, method, body })
  : gatewayRequest(path, { errorMessage, signal, method, body, auth })
const room = code => `/api/rooms/${encodeURIComponent(code)}`
const failed = 'Room request failed'

/** Every function takes identity = { devUser?, signal? } last. Actions return the updated room. */
export const fetchMyRoom = identity => call('/api/rooms/me', failed, identity)

/** Public on the gateway, so no session refresh is attempted. */
export const fetchPublicRooms = (page, size, identity) =>
  call(`/api/rooms?page=${page}&size=${size}`, failed, { ...identity, auth: false })

export const createRoom = (settings, identity) => call('/api/rooms', failed, { ...identity, method: 'POST', body: settings })

export const fetchRoom = (code, identity) => call(room(code), failed, identity)

export const joinRoom = (code, password, identity) =>
  call(`${room(code)}/join`, failed, { ...identity, method: 'POST', body: { password } })

export const leaveRoom = (code, identity) => call(`${room(code)}/leave`, failed, { ...identity, method: 'POST' })

export const setReady = (code, ready, identity) =>
  call(`${room(code)}/ready`, failed, { ...identity, method: 'PUT', body: { ready } })

export const kickMember = (code, accountId, identity) =>
  call(`${room(code)}/members/${accountId}`, failed, { ...identity, method: 'DELETE' })

export const transferOwner = (code, accountId, identity) =>
  call(`${room(code)}/owner`, failed, { ...identity, method: 'PUT', body: { accountId } })

export const inviteFriend = (code, accountId, identity) =>
  call(`${room(code)}/invitations`, failed, { ...identity, method: 'POST', body: { accountId } })

export const startRoom = (code, identity) => call(`${room(code)}/start`, failed, { ...identity, method: 'POST' })
