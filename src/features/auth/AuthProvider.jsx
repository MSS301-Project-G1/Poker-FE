import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { clearGatewaySession } from '@/shared/api/gatewayClient'
import { AuthContext } from './AuthContext'
import { fetchCurrentUser, initializeAuth, loginAccount, logoutAccount } from './api/authApi'

const initialState = { status: 'loading', user: null, error: null }

export default function AuthProvider({ children }) {
  const [state, setState] = useState(initialState)
  const bootstrapSequence = useRef(0)

  const restoreSession = useCallback(async sequence => {
    try {
      await initializeAuth()
      const user = await fetchCurrentUser()
      if (sequence === bootstrapSequence.current) setState({ status: 'authenticated', user, error: null })
    } catch (error) {
      if (sequence !== bootstrapSequence.current) return
      if (error.status === 401) setState({ status: 'anonymous', user: null, error: null })
      else setState({ status: 'error', user: null, error })
    }
  }, [])

  const bootstrap = useCallback(() => {
    const sequence = ++bootstrapSequence.current
    setState(current => ({ ...current, status: 'loading', error: null }))
    return restoreSession(sequence)
  }, [restoreSession])

  useEffect(() => {
    const sequence = ++bootstrapSequence.current
    void restoreSession(sequence)
  }, [restoreSession])

  const login = useCallback(async credentials => {
    await loginAccount(credentials)
    const user = await fetchCurrentUser()
    bootstrapSequence.current += 1
    setState({ status: 'authenticated', user, error: null })
    return user
  }, [])

  const logout = useCallback(async () => {
    await logoutAccount()
    bootstrapSequence.current += 1
    clearGatewaySession()
    setState({ status: 'anonymous', user: null, error: null })
  }, [])

  const refreshUser = useCallback(async () => {
    const user = await fetchCurrentUser()
    bootstrapSequence.current += 1
    setState({ status: 'authenticated', user, error: null })
    return user
  }, [])

  const endSession = useCallback(() => {
    bootstrapSequence.current += 1
    clearGatewaySession()
    setState({ status: 'anonymous', user: null, error: null })
  }, [])

  const value = useMemo(
    () => ({ ...state, bootstrap, login, logout, refreshUser, endSession }),
    [state, bootstrap, login, logout, refreshUser, endSession],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
