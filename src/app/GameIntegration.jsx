import { useCallback, useMemo } from 'react'
import { fetchWebSocketToken, useAuth } from '@/features/auth'
import { GameRuntimeContext } from '@/features/game-table'

export default function GameIntegration({ children }) {
  const { status } = useAuth()
  const getAccessToken = useCallback(async () => {
    if (status !== 'authenticated') return null
    return (await fetchWebSocketToken()).accessToken
  }, [status])
  const runtime = useMemo(() => ({ getAccessToken, profiles: {}, ChatPanel: null, rewards: null }), [getAccessToken])
  return <GameRuntimeContext.Provider value={runtime}>{children}</GameRuntimeContext.Provider>
}
