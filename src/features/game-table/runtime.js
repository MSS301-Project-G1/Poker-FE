import { createContext } from 'react'

// Integration port: the shared auth/profile/chat owners supply these from the app shell.
export const GameRuntimeContext = createContext({
  getAccessToken: async () => null,
  profiles: {},
  ChatPanel: null,
  rewards: null,
})
