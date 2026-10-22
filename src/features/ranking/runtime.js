import { createContext } from 'react'

// Integration port: the shared auth/profile owners supply these from the app shell.
export const RankingRuntimeContext = createContext({
  getAccessToken: async () => null,
  profiles: {},
})
