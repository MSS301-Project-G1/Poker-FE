import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { AuthStatusScreen, useAuth } from '@/features/auth'
import LobbyHeaderActions from '@/features/lobby/components/LobbyHeaderActions'
import { MainLayout } from '@/shared/layout'
import { paths } from '@/shared/config/paths'
import { useToast } from '@/shared/ui'
import { MatchmakingCard } from '@/features/ranked'
import { useWallet } from '@/features/shop'

export default function AuthenticatedLayout() {
  const auth = useAuth()
  const location = useLocation()
  const notify = useToast()
  const [logoutPending, setLogoutPending] = useState(false)
  const { wallet, coin, refreshWallet } = useWallet()
  // Matches, check-ins and purchases change the balance; reload it whenever the player moves to another screen.
  useEffect(() => { refreshWallet() }, [location.pathname, refreshWallet])

  if (auth.status === 'loading') return <AuthStatusScreen />
  if (auth.status === 'error') return <AuthStatusScreen error={auth.error} onRetry={auth.bootstrap} />
  if (auth.status !== 'authenticated') return <Navigate to={paths.auth} replace state={{ from: location }} />

  const logout = async () => {
    if (logoutPending) return
    setLogoutPending(true)
    try { await auth.logout() } catch (error) {
      const suffix = error.requestId ? ` Reference: ${error.requestId}` : ''
      notify(`${error.message || 'Unable to sign out.'}${suffix}`)
    } finally { setLogoutPending(false) }
  }

  return <><MainLayout renderHeaderActions={props => <LobbyHeaderActions {...props} />} user={auth.user} coins={wallet ? coin : null} onLogout={logout} logoutPending={logoutPending} /><MatchmakingCard /></>
}
