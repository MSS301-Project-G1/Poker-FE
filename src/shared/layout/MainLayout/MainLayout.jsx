import { Outlet } from 'react-router'
import AppHeader from './AppHeader'

// Shell for the signed-in screens: fixed header with navigation, then the page content.
// main is padded by the header height (h-20), so pages must not add min-h-screen or their own header clearance.
export default function MainLayout({ user, coins, onLogout, logoutPending, onOpenCheckIn, onOpenNotifications }) {
  return <div className="bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col">
    <AppHeader user={user} coins={coins} onLogout={onLogout} logoutPending={logoutPending} onOpenCheckIn={onOpenCheckIn} onOpenNotifications={onOpenNotifications} />
    <main className="w-full pt-20 flex-1 bg-surface-container-lowest"><Outlet /></main>
  </div>
}
