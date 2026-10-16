// Every route path in one place. Link with paths.lobby instead of typing '/lobby'.
export const paths = {
  home: '/',
  auth: '/auth',
  lobby: '/lobby',
  ranked: '/ranked',
  shop: '/shop',
  shopBundles: '/shop/bundles',
  shopProductDetail: id => `/shop/products/${id}`,
  events: '/events',
  mailbox: '/mailbox',
  table: '/table',
  tableById: tableId => `/table/${tableId}`,
  adminMatchSettings: '/admin/match-settings',
  adminShop: '/admin/shop',
}
