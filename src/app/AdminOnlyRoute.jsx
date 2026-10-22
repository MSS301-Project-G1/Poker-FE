import { Navigate, Outlet } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'

export default function AdminOnlyRoute() {
  const { user } = useAuth()
  return user?.role === 'ADMIN' ? <Outlet /> : <Navigate to={paths.lobby} replace />
}
