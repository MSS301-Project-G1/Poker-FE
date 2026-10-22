import { useState } from 'react'
import { Navigate, useLocation } from 'react-router'
import { AuthStatusScreen, useAuth } from '@/features/auth'
import { MainLayout } from '@/shared/layout'
import { paths } from '@/shared/config/paths'
import { useToast } from '@/shared/ui'
import { CommunityDock } from '@/features/community'
import { MatchmakingCard } from '@/features/ranked'

export default function AuthenticatedLayout() {
  const auth = useAuth()
  const location = useLocation()
  const notify = useToast()
  const [logoutPending, setLogoutPending] = useState(false)

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

  return <><MainLayout user={auth.user} onLogout={logout} logoutPending={logoutPending} /><MatchmakingCard /><CommunityDock showLauncher={location.pathname !== paths.lobby} /></>
}
