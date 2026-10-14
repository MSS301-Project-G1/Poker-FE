import { Outlet } from 'react-router'
import AppHeader from './AppHeader'
import TickerFooter from './TickerFooter'

// Shell for the signed-in screens: fixed header with navigation, page content, fixed ticker footer.
// Pages rendered inside only return their own content.
export default function MainLayout() {
  return <div className="bg-surface-container-lowest text-on-surface font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary selection:text-on-primary">
    <AppHeader />
    <main className="w-full pt-20 flex-1 bg-surface-container-lowest"><Outlet /></main>
    <TickerFooter />
  </div>
}
