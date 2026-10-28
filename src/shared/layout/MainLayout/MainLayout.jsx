import { Outlet } from 'react-router'
import AppHeader from './AppHeader'
import TickerFooter from './TickerFooter'

// Shell for the signed-in screens: fixed header with navigation, page content, fixed ticker footer.
// Pages rendered inside only return their own content. main is padded by the header (h-20) and
// footer (h-10) heights, so pages must not add min-h-screen or their own footer clearance.
export default function MainLayout({ user, coins, onLogout, logoutPending }) {
  return <div className="bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
    <AppHeader user={user} coins={coins} onLogout={onLogout} logoutPending={logoutPending} />
    <main className="w-full pt-20 pb-10 flex-1 bg-surface-container-lowest"><Outlet /></main>
    <TickerFooter />
  </div>
}
