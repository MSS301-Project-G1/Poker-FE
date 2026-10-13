import RoomsPage from './RoomsPage'
import RoomLobbyPage from './RoomLobbyPage'

export const customRoomRoutes = [{ path: '/rooms/:roomCode', component: RoomLobbyPage }, { path: '/rooms', component: RoomsPage }]

export function resolveCustomRoomRoute(pathname) {
  if (pathname === '/rooms') return { Page: RoomsPage, props: {} }
  const match = pathname.match(/^\/rooms\/([A-Za-z0-9]{4,16})$/)
  return match ? { Page: RoomLobbyPage, props: { roomCode: match[1].toUpperCase() } } : null
}
