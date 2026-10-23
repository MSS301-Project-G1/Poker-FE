import { test, expect } from '@playwright/test'

const self = '00000000-0000-0000-0000-000000000001'
const tableId = '00000000-0000-0000-0000-000000000010'
const matchId = '00000000-0000-0000-0000-000000000020'
const proposalId = '00000000-0000-0000-0000-000000000030'

async function fixture(page, mode = 'RANK') {
  let queue = { status: 'NONE' }
  let subscription, gameSocket, action
  let snapshot = {
    tableId, matchId, accountId: self, mode, street: 'PREFLOP', handNumber: 1, actionSequence: 1,
    board: [], pot: 30, actorSeat: 0, dealerSeat: 5, smallBlindSeat: 0, bigBlindSeat: 1,
    callAmount: 10, currentBet: 20, minRaiseTo: 40, maxRaiseTo: 1000, legalActions: ['FOLD', 'CALL', 'RAISE', 'ALL_IN'],
    serverTime: new Date().toISOString(), deadline: new Date(Date.now() + 60000).toISOString(),
    seats: Array.from({ length: 6 }, (_, index) => ({
      accountId: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`, seatIndex: index,
      chips: index === 0 ? 990 : index === 1 ? 980 : 1000, streetBet: index === 0 ? 10 : index === 1 ? 20 : 0,
      holeCardCount: 2, cards: index === 0 ? [{ rank: 'ACE', suit: 'SPADES' }, { rank: 'KING', suit: 'HEARTS' }] : [],
      folded: false, eliminated: false, leftEarly: false, lastAction: null,
    })),
  }
  function push() {
    if (subscription) gameSocket.send(`MESSAGE\nsubscription:${subscription}\nmessage-id:snapshot-${snapshot.actionSequence}\ncontent-type:application/json\n\n${JSON.stringify(snapshot)}\0`)
  }
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    if (!path.startsWith('/api/')) return route.fallback()
    if (path === '/api/auth/csrf') return route.fulfill({ json: { result: { token: 'test-csrf' } } })
    if (path === '/api/auth/me') return route.fulfill({ json: { result: { accountId: self, email: 'player@example.test', role: 'USER', profile: { displayName: 'DuyPhan' } } } })
    if (path === '/api/auth/ws-token') return route.fulfill({ json: { result: { accessToken: 'test-token', expiresAt: new Date(Date.now() + 60000).toISOString() } } })
    if (path === '/api/profiles/batch') return route.fulfill({ json: { result: snapshot.seats.map((seat, index) => ({ accountId: seat.accountId, displayName: index === 0 ? 'DuyPhan' : `Player ${index + 1}`, avatarUrl: '/stitch-assets/avatar.svg' })) } })
    if (path === `/api/matchmaking/${mode.toLowerCase()}/status`) return route.fulfill({ json: queue })
    if (/^\/api\/matchmaking\/(normal|rank)\/status$/.test(path)) return route.fulfill({ json: { status: 'NONE' } })
    if (path === `/api/matchmaking/proposals/${proposalId}/accept`) return route.fulfill({ json: queue })
    if (path === `/api/game/tables/${tableId}`) return route.fulfill({ json: snapshot })
    if (path === '/api/chat/conversations') return route.fulfill({ json: { items: [], page: 0, totalPages: 0 } })
    return route.fulfill({ status: 503, json: { message: 'No fixture for this endpoint.' } })
  })
  for (const path of ['/ws/game', '/ws/chat', '/ws/social']) {
    await page.routeWebSocket(`**${path}`, ws => ws.onMessage(frame => {
      const text = frame.toString()
      if (text.startsWith('CONNECT\n')) ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0')
      if (path !== '/ws/game') return
      if (text.startsWith('SUBSCRIBE\n') && text.includes(`/user/queue/tables/${tableId}`)) {
        subscription = text.match(/\nid:([^\n]+)/)[1]
        gameSocket = ws
      }
      if (text.startsWith('SEND\n') && text.includes(`/app/tables/${tableId}/action`)) {
        action = JSON.parse(text.split('\n\n')[1].replace(/\0$/, ''))
        snapshot = { ...snapshot, actionSequence: 2, actorSeat: 1, pot: 40, legalActions: [], seats: snapshot.seats.map((seat, index) => index === 0 ? { ...seat, chips: 980, streetBet: 20, lastAction: 'CALL' } : seat) }
        push()
      }
      if (text.startsWith('SEND\n') && text.includes(`/app/tables/${tableId}/sync`)) push()
    }))
  }
  return { setQueue: next => { queue = next }, action: () => action, push: next => { snapshot = next; push() } }
}

for (const mode of ['NORMAL', 'RANK']) test(`${mode}: elapsed wait, fill countdown, table confirmation, then 2D game`, async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const state = await fixture(page, mode)
  const base = { mode, joinedAt: new Date(Date.now() - 75000).toISOString(), minPlayers: 2, maxPlayers: 6 }
  state.setQueue({ ...base, status: 'WAITING', playerCount: 1, playerIds: [self] })
  await page.goto(`/ranked?mode=${mode}`)
  await expect(page.getByText('SEARCHING TABLE', { exact: true })).toBeVisible()
  await expect(page.getByText(/01:1[5-9]/)).toBeVisible()
  state.setQueue({ ...base, status: 'COUNTDOWN', playerCount: 2, playerIds: [self, '00000000-0000-0000-0000-000000000002'], matchStartDeadline: new Date(Date.now() + 30000).toISOString() })
  await expect(page.getByText('CHỜ THÊM NGƯỜI CHƠI', { exact: true })).toBeVisible()
  await expect(page.getByText(/00:2[0-9]/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Chấp nhận trận', exact: true })).toHaveCount(0)
  state.setQueue({ ...base, status: 'PROPOSED', proposalId, playerIds: [self, '00000000-0000-0000-0000-000000000002'], acceptDeadline: new Date(Date.now() + 30000).toISOString() })
  await expect(page.getByRole('region', { name: 'Xác nhận trận trên bàn 3D' })).toBeVisible()
  await expect(page.getByTestId('live-table-3d')).toHaveAttribute('data-camera-phase', 'playing', { timeout: 30000 })
  await page.screenshot({ path: `artifacts/community-${mode.toLowerCase()}-confirmation.png` })
  await page.getByRole('button', { name: 'Chấp nhận trận', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Đã xác nhận', exact: true })).toBeDisabled()
  await expect(page).toHaveURL(/ranked/)
  state.setQueue({ status: 'READY', mode, tableId, matchId, proposalId })
  await expect(page).toHaveURL(new RegExp(`/table/${tableId}$`))
  await expect(page.getByTestId('live-table-3d')).toHaveCount(0)
  await expect(page.getByLabel('Your cards')).toBeVisible()
  await expect(page.getByLabel('Hidden card')).toHaveCount(10)
  await expect(page.getByRole('button', { name: /^CALL/ })).toBeEnabled()
  await page.getByRole('button', { name: /^CALL/ }).click()
  await expect.poll(state.action).toEqual({ type: 'CALL', actionSequence: 1 })
  await page.screenshot({ path: `artifacts/community-${mode.toLowerCase()}-2d-game.png`, fullPage: true })
  await page.reload()
  await expect(page.getByLabel('Your cards')).toBeVisible()
  await expect(page.getByTestId('live-table-3d')).toHaveCount(0)
})

test('mobile game opens directly in 2D without requiring WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) { return type.startsWith('webgl') ? null : original.call(this, type, ...args) }
  })
  await fixture(page)
  await page.goto(`/table/${tableId}`)
  await expect(page.getByTestId('live-table-3d')).toHaveCount(0)
  await expect(page.getByLabel('Your cards')).toBeVisible()
  await expect(page.getByRole('button', { name: /^CALL/ })).toBeEnabled()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
