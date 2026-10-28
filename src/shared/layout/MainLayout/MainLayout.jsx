import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { paths } from '@/shared/config/paths'
import AppHeader from './AppHeader'
import TickerFooter from './TickerFooter'

// Shell for the signed-in screens: fixed header with navigation, page content, fixed ticker footer.
// Pages rendered inside only return their own content. main is padded by the header (h-20) and
// footer (h-10) heights, so pages must not add min-h-screen or their own footer clearance.
export default function MainLayout({ user, coins, onLogout, logoutPending, renderHeaderActions }) {
  const [lobbyZen, setLobbyZen] = useState(false)
  const isLobby = useLocation().pathname === paths.lobby
  return <div className="bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
    <AppHeader headerActions={renderHeaderActions?.({ isLobby, lobbyZen, onToggleLobbyZen: () => setLobbyZen(value => !value) })} user={user} coins={coins} onLogout={onLogout} logoutPending={logoutPending} />
    <main className="w-full pt-20 pb-10 flex-1 bg-surface-container-lowest"><Outlet context={{ lobbyZen, setLobbyZen }} /></main>
    <TickerFooter />
  </div>
}
