import { BrowserRouter } from 'react-router'
import { AuthProvider } from '@/features/auth'
import { ToastProvider } from '@/shared/ui'
import AppRoutes from './router'
import ScrollToTop from './ScrollToTop'

// App shell: providers that every screen needs. Shared auth, profile and chat providers belong here.
export default function App() {
  return <BrowserRouter>
    <ScrollToTop />
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
}
