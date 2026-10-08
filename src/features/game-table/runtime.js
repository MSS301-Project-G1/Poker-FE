import { createContext } from 'react'

// The shared auth/profile/chat owners supply these integrations from the app shell.
export const GameRuntimeContext = createContext({
  getAccessToken: async () => null,
  profiles: {},
  ChatPanel: null,
  rewards: null,
})

export const gameDevMode = import.meta.env.DEV && import.meta.env.VITE_GAME_DEV_MODE === 'true'

export function devIdentity() {
  if (!gameDevMode) return null
  return new URLSearchParams(window.location.search).get('devUser') || sessionStorage.getItem('poker.game.devUser')
}
