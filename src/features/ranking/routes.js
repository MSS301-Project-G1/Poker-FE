import LeaderboardPage from './LeaderboardPage'

export const rankingRoutes = [{ path: '/ranking', component: LeaderboardPage }]

export function resolveRankingRoute(pathname) {
  return pathname === '/ranking' ? { Page: LeaderboardPage, props: {} } : null
}
