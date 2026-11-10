import { useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { Button, PlaceholderScreen } from '@/shared/ui'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const destination = user?.role === 'ADMIN' ? paths.admin : user ? paths.lobby : paths.auth
  return <PlaceholderScreen title="404 · Page not found" message="The page you’re looking for doesn’t exist.">
    <Button variant="primary" onClick={() => navigate(destination, { replace: true })}>{user?.role === 'ADMIN' ? 'Back to admin' : user ? 'Back to lobby' : 'Sign in'}</Button>
  </PlaceholderScreen>
}
