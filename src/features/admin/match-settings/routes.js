import MatchSettingsPage from './MatchSettingsPage'

export const matchSettingsRoutes = [{ path: '/admin/match-settings', component: MatchSettingsPage }]

export function resolveMatchSettingsRoute(pathname) {
  return pathname === '/admin/match-settings' ? { Page: MatchSettingsPage, props: {} } : null
}
