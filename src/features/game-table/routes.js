import GameTablePage from './GameTablePage'

export const gameTableRoutes = [{ path: '/table/:tableId', component: GameTablePage }, { path: '/table', component: GameTablePage }]

export function resolveGameTableRoute(pathname) {
  if (pathname === '/table') return { Page: GameTablePage, props: {} }
  const match = pathname.match(/^\/table\/([0-9a-f-]{36})$/i)
  return match ? { Page: GameTablePage, props: { tableId: match[1] } } : null
}
