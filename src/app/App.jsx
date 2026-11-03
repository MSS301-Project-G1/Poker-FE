import { BrowserRouter, useLocation } from 'react-router'
import { AuthProvider, useAuth } from '@/features/auth'
import { ConfirmProvider, ToastProvider } from '@/shared/ui'
import { CommunityDock, CommunityProvider } from '@/features/community'
import { fetchActiveTable } from '@/features/game-table'
import { MatchmakingProvider } from '@/features/ranked'
import { SoundProvider } from '@/shared/audio'
import { paths } from '@/shared/config/paths'
import AppRoutes from './router'
import GameRuntimeBridge from './GameRuntimeBridge'
import ScrollToTop from './ScrollToTop'

// A signed-in account with a running table goes back to that seat before lobby or shop can open.
const activeTablePath = () => fetchActiveTable().then(table => table?.tableId ? paths.tableById(table.tableId) : null)

// Admin navigation does not start the player's wallet, matchmaking or community sockets.
function SessionRoutes() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const administrative = pathname === paths.admin || pathname.startsWith(`${paths.admin}/`)
    || (user?.role === 'ADMIN' && [paths.home, paths.auth].includes(pathname))
  if (administrative) return <AppRoutes />
  return <CommunityProvider><MatchmakingProvider><GameRuntimeBridge><AppRoutes /><CommunityDock /></GameRuntimeBridge></MatchmakingProvider></CommunityProvider>
}

// App shell: providers that every screen needs. Shared auth, profile and chat providers belong here.
export default function App() {
  return <BrowserRouter>
    <ScrollToTop />
    <SoundProvider><AuthProvider resumePath={activeTablePath}>
      <ToastProvider><ConfirmProvider>
        <SessionRoutes />
      </ConfirmProvider></ToastProvider>
    </AuthProvider></SoundProvider>
  </BrowserRouter>
}
