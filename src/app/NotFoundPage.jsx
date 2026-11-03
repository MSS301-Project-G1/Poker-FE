import { useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { Button, PlaceholderScreen } from '@/shared/ui'

export default function NotFoundPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const destination = user?.role === 'ADMIN' ? paths.admin : user ? paths.lobby : paths.auth
  return <PlaceholderScreen title="404 · Không tìm thấy trang" message="Trang bạn tìm không tồn tại.">
    <Button variant="primary" onClick={() => navigate(destination, { replace: true })}>{user?.role === 'ADMIN' ? 'Về trang quản trị' : user ? 'Về sảnh' : 'Đăng nhập'}</Button>
  </PlaceholderScreen>
}
