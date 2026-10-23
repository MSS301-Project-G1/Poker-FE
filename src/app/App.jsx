import { BrowserRouter } from 'react-router'
import { AuthProvider } from '@/features/auth'
import { ConfirmProvider, ToastProvider } from '@/shared/ui'
import { CommunityDock, CommunityProvider } from '@/features/community'
import { MatchmakingProvider } from '@/features/ranked'
import { SoundProvider } from '@/shared/audio'
import AppRoutes from './router'
import GameRuntimeBridge from './GameRuntimeBridge'
import ScrollToTop from './ScrollToTop'

// App shell: providers that every screen needs. Shared auth, profile and chat providers belong here.
export default function App() {
  return <BrowserRouter>
    <ScrollToTop />
    <SoundProvider><AuthProvider>
      <ToastProvider><ConfirmProvider>
        <CommunityProvider><MatchmakingProvider><GameRuntimeBridge><AppRoutes /><CommunityDock /></GameRuntimeBridge></MatchmakingProvider></CommunityProvider>
      </ConfirmProvider></ToastProvider>
    </AuthProvider></SoundProvider>
  </BrowserRouter>
}
