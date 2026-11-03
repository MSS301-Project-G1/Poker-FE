import { Outlet } from 'react-router'
import { AuthStatusScreen, useAuth } from '@/features/auth'
import NotFoundPage from './NotFoundPage'

export default function AdminOnlyRoute() {
  const auth = useAuth()
  if (auth.status === 'loading') return <AuthStatusScreen />
  if (auth.status === 'error') return <AuthStatusScreen error={auth.error} onRetry={auth.bootstrap} />
  return auth.status === 'authenticated' && auth.user?.role === 'ADMIN' ? <Outlet /> : <NotFoundPage />
}
