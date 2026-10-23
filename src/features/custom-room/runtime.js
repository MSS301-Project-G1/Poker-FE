import { createContext } from 'react'

// Integration port: the shared auth/profile owners supply these from the app shell.
export const RoomRuntimeContext = createContext({
  getAccessToken: async () => null,
  accountId: null, // signed-in account from shared auth; marks "You" and the host controls
  profiles: {},
})
