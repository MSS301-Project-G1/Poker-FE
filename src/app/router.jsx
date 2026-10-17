import { Route, Routes } from 'react-router'
import { paths } from '@/shared/config/paths'
import { MainLayout } from '@/shared/layout'
import { MatchSettingsPage } from '@/features/admin/match-settings'
import { AdminShopPage } from '@/features/admin/shop'
import { AuthPage } from '@/features/auth'
import { EventsPage } from '@/features/events'
import { GameTablePage } from '@/features/game-table'
import { LobbyPage } from '@/features/lobby'
import { MailboxPage } from '@/features/mailbox'
import { RankedPage } from '@/features/ranked'
import { ShopPage, BundlePage, ProductDetailPage } from '@/features/shop'
import NotFoundPage from './NotFoundPage'

// The single route table. A new screen = a page exported from its feature + one <Route> here.
export default function AppRoutes() {
  return <Routes>
    <Route path={paths.home} element={<AuthPage />} />
    <Route path={paths.auth} element={<AuthPage />} />
    <Route element={<MainLayout />}>
      <Route path={paths.lobby} element={<LobbyPage />} />
      <Route path={paths.ranked} element={<RankedPage />} />
      <Route path={paths.shop} element={<ShopPage />} />
      <Route path={paths.shopBundles} element={<BundlePage />} />
      <Route path={paths.shopProductDetail(':id')} element={<ProductDetailPage />} />
    </Route>
    <Route path={paths.events} element={<EventsPage />} />
    <Route path={paths.mailbox} element={<MailboxPage />} />
    <Route path={paths.table} element={<GameTablePage />} />
    <Route path={paths.tableById(':tableId')} element={<GameTablePage />} />
    <Route path={paths.adminMatchSettings} element={<MatchSettingsPage />} />
    <Route path={paths.adminShop} element={<AdminShopPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
