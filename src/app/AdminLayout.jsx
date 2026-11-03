import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { adminNavigation } from '@/shared/config/adminNavigation'
import { paths } from '@/shared/config/paths'
import { Button, Icon, useToast } from '@/shared/ui'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const notify = useToast()
  const [pending, setPending] = useState(false)
  const signOut = async () => {
    if (pending) return
    setPending(true)
    try {
      await logout()
      navigate(paths.auth, { replace: true })
    } catch (error) {
      notify(error.message || 'Chưa đăng xuất được. Vui lòng thử lại.')
    } finally { setPending(false) }
  }
  return <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md">
    <header className="border-b border-outline-variant/40 bg-surface-container-low px-margin py-space-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-space-md">
        <Link to={paths.admin} className="flex items-center gap-3 font-headline-md text-headline-md"><Icon name="admin_panel_settings" className="text-primary" />MSS Poker Admin</Link>
        <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-on-surface-variant">{user.email}</span><span className="rounded-full bg-primary-container px-3 py-1 text-xs text-on-primary-container">ADMIN</span><Button disabled={pending} onClick={signOut}><Icon name="logout" />{pending ? 'Đang đăng xuất…' : 'Đăng xuất'}</Button></div>
      </div>
      <nav aria-label="Điều hướng quản trị" className="mx-auto mt-space-md flex max-w-7xl flex-wrap gap-2">
        {[{ path: paths.admin, label: 'Trang quản trị', icon: 'dashboard' }, ...adminNavigation].map(item => <NavLink key={item.path} to={item.path} end={item.path === paths.admin}
          className={({ isActive }) => `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-primary-container text-on-primary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}>
          <Icon name={item.icon} className="text-lg" />{item.label}
        </NavLink>)}
      </nav>
    </header>
    <main><Outlet /></main>
  </div>
}
