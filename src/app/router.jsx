import { Route, Routes } from 'react-router'
import { env } from '@/shared/config/env'
import { paths } from '@/shared/config/paths'
import { AccountPage } from '@/features/account'
import { AdminAvatarsPage } from '@/features/admin/avatars'
import { MatchSettingsPage } from '@/features/admin/match-settings'
import { AdminShopPage, AdminEditProductPage } from '@/features/admin/shop'
import { AdminSeasonsPage } from '@/features/admin/seasons'
import { AdminTournamentsPage } from '@/features/admin/tournaments'
import { AuthPage } from '@/features/auth'
import { DemoPage } from '@/features/demo'
import { RoomLobbyPage, RoomsPage } from '@/features/custom-room'
import { EventsPage } from '@/features/events'
import { GameTablePage } from '@/features/game-table'
import { LobbyPage } from '@/features/lobby'
import { MailboxPage } from '@/features/mailbox'
import { RankedPage } from '@/features/ranked'
import { LeaderboardPage } from '@/features/ranking'
import { SeasonPage } from '@/features/season'
import { ShopPage, BundlePage, ProductDetailPage, PaymentResultPage } from '@/features/shop'
import { TournamentPage, TournamentsPage } from '@/features/tournament'
import AdminOnlyRoute from './AdminOnlyRoute'
import NotFoundPage from './NotFoundPage'
import AuthenticatedLayout from './AuthenticatedLayout'

// The single route table. A new screen = a page exported from its feature + one <Route> here.
export default function AppRoutes() {
  return <Routes>
    <Route path={paths.home} element={<AuthPage />} />
    <Route path={paths.auth} element={<AuthPage />} />
    <Route path={paths.demo} element={<DemoPage />} />
    <Route element={<AuthenticatedLayout />}>
      <Route path={paths.lobby} element={<LobbyPage />} />
      <Route path={paths.account} element={<AccountPage />} />
      <Route path={paths.ranked} element={<RankedPage />} />
      <Route path={paths.shop} element={<ShopPage />} />
      <Route path={paths.shopBundles} element={<BundlePage />} />
      <Route path={paths.shopProductDetail(':id')} element={<ProductDetailPage />} />
      <Route path={paths.shopPaymentSuccess} element={<PaymentResultPage />} />
      <Route path={paths.shopPaymentCancel} element={<PaymentResultPage />} />
      <Route path={paths.ranking} element={<LeaderboardPage />} />
      <Route path={paths.seasons} element={<SeasonPage />} />
      <Route path={paths.rooms} element={<RoomsPage />} />
      <Route path={paths.roomByCode(':roomCode')} element={<RoomLobbyPage />} />
      <Route path={paths.tournaments} element={<TournamentsPage />} />
      <Route path={paths.tournamentById(':tournamentId')} element={<TournamentPage />} />
      <Route element={<AdminOnlyRoute />}>
        <Route path={paths.adminAvatars} element={<AdminAvatarsPage />} />
        <Route path={paths.adminShop} element={<AdminShopPage />} />
        <Route path={paths.adminShopEditProduct(':id')} element={<AdminEditProductPage />} />
        <Route path={paths.adminShopAddProduct} element={<AdminEditProductPage />} />
        <Route path={paths.adminSeasons} element={<AdminSeasonsPage />} />
        <Route path={paths.adminTournaments} element={<AdminTournamentsPage />} />
        {!env.gameDevMode && <Route path={paths.adminMatchSettings} element={<MatchSettingsPage />} />}
      </Route>
    </Route>
    <Route path={paths.events} element={<EventsPage />} />
    <Route path={paths.mailbox} element={<MailboxPage />} />
    <Route path={paths.table} element={<GameTablePage />} />
    <Route path={paths.tableById(':tableId')} element={<GameTablePage />} />
    {/* Local game tooling only: ?devUser identities exercise Admin settings without a gateway session. */}
    {env.gameDevMode && <Route path={paths.adminMatchSettings} element={<MatchSettingsPage />} />}
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
}
