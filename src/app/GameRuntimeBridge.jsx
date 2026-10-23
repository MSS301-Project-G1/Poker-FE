import { useCallback, useMemo } from 'react'
import { fetchWebSocketToken, useAuth } from '@/features/auth'
import { GameRuntimeContext } from '@/features/game-table'

// Supply the existing table integration port with the same cookie-authorized token flow.
export default function GameRuntimeBridge({ children }) {
  const { status, user } = useAuth()
  const getAccessToken = useCallback(async () => {
    if (status !== 'authenticated') return null
    const token = await fetchWebSocketToken()
    if (!token?.accessToken) throw new Error('The server did not return a WebSocket token.')
    return token.accessToken
  }, [status])
  const value = useMemo(() => ({ getAccessToken, profiles: user?.accountId ? { [user.accountId]: user.profile } : {}, ChatPanel: null, rewards: null }), [getAccessToken, user])
  return <GameRuntimeContext.Provider value={value}>{children}</GameRuntimeContext.Provider>
}
