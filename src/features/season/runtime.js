import { createContext } from 'react'

// Integration port: the shared auth owner supplies the access token from the app shell.
export const SeasonRuntimeContext = createContext({
  getAccessToken: async () => null,
})
