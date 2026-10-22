import { BrowserRouter } from 'react-router'
import { AuthProvider } from '@/features/auth'
import { ToastProvider } from '@/shared/ui'
import { CommunityProvider } from '@/features/community'
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
      <ToastProvider>
        <CommunityProvider><MatchmakingProvider><GameRuntimeBridge><AppRoutes /></GameRuntimeBridge></MatchmakingProvider></CommunityProvider>
      </ToastProvider>
    </AuthProvider></SoundProvider>
  </BrowserRouter>
}
