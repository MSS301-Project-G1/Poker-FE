import { createContext } from 'react'

// The shared auth/profile owners supply these integrations from the app shell.
export const RoomRuntimeContext = createContext({
  getAccessToken: async () => null,
  accountId: null, // signed-in account from shared auth; marks "You" and the host controls
  profiles: {},
})

export const roomDevMode = import.meta.env.DEV && import.meta.env.VITE_COMPETITION_DEV_MODE === 'true'

const devUserKey = 'poker.competition.devUser'

// Local development only: without the gateway, the backend reads the player from X-User-Id.
export function devIdentity() {
  if (!roomDevMode) return null
  const fromUrl = new URLSearchParams(window.location.search).get('devUser')
  try {
    if (fromUrl) sessionStorage.setItem(devUserKey, fromUrl)
    return fromUrl || sessionStorage.getItem(devUserKey)
  } catch {
    return fromUrl
  }
}
