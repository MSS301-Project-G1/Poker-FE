import { createContext, useContext } from 'react'

export const MatchmakingContext = createContext(null)
export function useQueue() {
  const context = useContext(MatchmakingContext)
  if (!context) throw new Error('MatchmakingProvider is required.')
  return context
}
