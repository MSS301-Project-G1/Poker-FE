// Every route path in one place. Link with paths.lobby instead of typing '/lobby'.
export const paths = {
  home: '/',
  auth: '/auth',
  lobby: '/lobby',
  ranked: '/ranked',
  shop: '/shop',
  events: '/events',
  mailbox: '/mailbox',
  table: '/table',
  tableById: tableId => `/table/${tableId}`,
  ranking: '/ranking',
  rooms: '/rooms',
  roomByCode: roomCode => `/rooms/${roomCode}`,
  adminMatchSettings: '/admin/match-settings',
}
