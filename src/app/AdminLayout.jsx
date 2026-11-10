import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/features/auth'
import { paths } from '@/shared/config/paths'
import { useToast } from '@/shared/ui'
import { AdminSidebar } from '@/features/admin'

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
      notify(error.message || 'Couldn’t sign out. Please try again.')
    } finally { setPending(false) }
  }
  return <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body-md text-body-md flex flex-col md:flex-row selection:bg-primary selection:text-on-primary">
    <AdminSidebar user={user} onSignOut={signOut} signOutPending={pending} />
    <main className="flex-1 min-w-0 w-full p-space-md lg:p-space-lg overflow-y-auto"><Outlet /></main>
  </div>
}
