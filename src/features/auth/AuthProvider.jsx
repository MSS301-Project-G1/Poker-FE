import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { paths } from '@/shared/config/paths'
import { clearGatewaySession } from '@/shared/api/gatewayClient'
import { onSessionChange, onSessionLost, sessionErrors } from '@/shared/api/tabSession'
import { AuthContext } from './AuthContext'
import { checkSession, claimSession, fetchCurrentUser, initializeAuth, loginAccount, logoutAccount } from './api/authApi'
import SessionLockScreen from './components/SessionLockScreen'

const initialState = { status: 'loading', user: null, error: null }
const anonymous = { status: 'anonymous', user: null, error: null }
// BE contract: the owner tab is re-checked about every 2 seconds and on focus.
const sessionCheckMs = 2000

// A tab taken over meanwhile locks; an ended session asks for sign-in again.
function failedState(error) {
  if ([sessionErrors.tabReplaced, sessionErrors.banned].includes(error.code)) return { status: 'locked', user: null, error }
  return error.status === 401 ? anonymous : { status: 'error', user: null, error }
}

/** resumePath() resolves the page the account must reopen first (its running table), or null. */
export default function AuthProvider({ resumePath, children }) {
  const [state, setState] = useState(initialState)
  const bootstrapSequence = useRef(0)
  // useNavigate changes on every route; kept in a ref so navigating never restarts the bootstrap.
  const navigate = useNavigate()
  const navigateRef = useRef(navigate)
  useEffect(() => { navigateRef.current = navigate })

  // A tab/login takeover stays locked until reload; a banned account can return to sign-in.
  const update = useCallback(next => setState(current => current.status === 'locked' ? current : next), [])

  // Loads the account, then opens its running table before any other screen can mount.
  const enter = useCallback(async (sequence, start) => {
    try {
      await start?.()
      const user = await fetchCurrentUser()
      const path = user.role === 'ADMIN' ? null : await resumePath?.()
      if (sequence !== bootstrapSequence.current) return
      if (path && window.location.pathname !== path) navigateRef.current(path, { replace: true })
      update({ status: 'authenticated', user, error: null })
    } catch (error) {
      if (sequence === bootstrapSequence.current) update(failedState(error))
    }
  }, [resumePath, update])

  const restoreSession = useCallback(sequence => enter(sequence, async () => {
    await initializeAuth()
    await claimSession()
  }), [enter])

  const bootstrap = useCallback(() => {
    const sequence = ++bootstrapSequence.current
    setState(current => ({ ...current, status: 'loading', error: null }))
    return restoreSession(sequence)
  }, [restoreSession])

  useEffect(() => {
    const sequence = ++bootstrapSequence.current
    void restoreSession(sequence)
  }, [restoreSession])

  useEffect(() => onSessionLost(error => {
    setState(current => current.status === 'authenticated' ? { status: 'locked', user: null, error } : current)
  }), [])

  useEffect(() => {
    if (state.status !== 'authenticated') return undefined
    const check = () => checkSession().catch(error => {
      // Lost ownership is reported by the client; a session that ended (refresh rejected) needs sign-in.
      if (error.status === 401 && error.code !== sessionErrors.replaced) {
        bootstrapSequence.current += 1
        clearGatewaySession()
        update(anonymous)
      }
    })
    const timer = window.setInterval(check, sessionCheckMs)
    window.addEventListener('focus', check)
    const stopListening = onSessionChange(check)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', check); stopListening() }
  }, [state.status, update])

  const login = useCallback(async credentials => {
    await loginAccount(credentials)
    await enter(++bootstrapSequence.current)
  }, [enter])

  const logout = useCallback(async () => {
    await logoutAccount()
    bootstrapSequence.current += 1
    clearGatewaySession()
    update(anonymous)
  }, [update])

  const refreshUser = useCallback(async () => {
    const user = await fetchCurrentUser()
    bootstrapSequence.current += 1
    update({ status: 'authenticated', user, error: null })
    return user
  }, [update])

  const endSession = useCallback(() => {
    bootstrapSequence.current += 1
    clearGatewaySession()
    update(anonymous)
  }, [update])

  const value = useMemo(
    () => ({ ...state, bootstrap, login, logout, refreshUser, endSession }),
    [state, bootstrap, login, logout, refreshUser, endSession],
  )
  // Unmounting everything else closes every socket and blocks every action, shop and wallet included.
  return <AuthContext.Provider value={value}>
    {state.status === 'locked' ? <SessionLockScreen error={state.error} onSignIn={() => {
      bootstrapSequence.current += 1
      clearGatewaySession()
      setState(anonymous)
      navigateRef.current(paths.auth, { replace: true })
    }} /> : children}
  </AuthContext.Provider>
}
