import { test, expect } from '@playwright/test'

const proposalId = '00000000-0000-0000-0000-000000000010'
const tableId = '00000000-0000-0000-0000-000000000020'
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('poker.lobby.checkInDismissed', 'true'))
  await page.route('**/api/party/me', route => route.fulfill({ json: null }))
  await page.route('**/api/matchmaking/*/status', route => route.fulfill({ json: { status: 'NONE' } }))
  await page.route('**/api/auth/csrf', route => route.fulfill({ json: { result: { token: 'test-csrf' } } }))
  await page.route('**/api/auth/me', route => route.fulfill({ json: { result: { accountId: 'player', email: 'test@example.com', role: 'USER' } } }))
})

test('Rank join, accept and ready navigate to the exact table', async ({ page }) => {
  let queue = { status: 'NONE' }
  let joinHeaders
  let accepted = false
  await page.route('**/api/matchmaking/rank/status', route => route.fulfill({ json: queue }))
  await page.route('**/api/matchmaking/rank/join', route => {
    joinHeaders = route.request().headers()
    queue = { status: 'WAITING', playerCount: 1, minPlayers: 2, maxPlayers: 6 }
    return route.fulfill({ json: queue })
  })
  await page.route(`**/api/matchmaking/proposals/${proposalId}/accept`, route => {
    accepted = true
    queue = { status: 'READY', tableId }
    return route.fulfill({ json: queue })
  })
  await page.goto('/ranked')
  await page.getByRole('button', { name: 'Tìm trận', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Đang tìm người chơi' })).toBeVisible()
  await expect(page).toHaveURL(/\/ranked$/)
  await expect(page.getByTestId('matchmaking-card')).toHaveCount(0)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'artifacts/community-ranked-restored.png', fullPage: true })
  expect(joinHeaders['x-xsrf-token']).toBe('test-csrf')
  expect(joinHeaders['x-user-id']).toBeUndefined()
  queue = { status: 'PROPOSED', proposalId, acceptDeadline: new Date(Date.now() + 20000).toISOString() }
  await page.getByRole('button', { name: 'Chấp nhận trận' }).click()
  await expect(page).toHaveURL(new RegExp(`/table/${tableId}$`))
  expect(accepted).toBe(true)
})

test('Normal queue cancels through DELETE before returning to the lobby', async ({ page }) => {
  let queue = { status: 'NONE' }
  let cancelled = false
  await page.route('**/api/matchmaking/normal/status', route => route.fulfill({ json: queue }))
  await page.route('**/api/matchmaking/normal/join', route => {
    queue = { status: 'WAITING', playerCount: 1, minPlayers: 2, maxPlayers: 6 }
    return route.fulfill({ json: queue })
  })
  await page.route('**/api/matchmaking/normal/leave', route => {
    cancelled = route.request().method() === 'DELETE'
    queue = { status: 'NONE' }
    return route.fulfill({ status: 204 })
  })
  await page.goto('/ranked?mode=NORMAL')
  await page.getByRole('button', { name: 'Tìm trận', exact: true }).click()
  await page.getByRole('button', { name: 'Hủy tìm trận' }).click()
  await expect(page).toHaveURL(/\/lobby$/)
  expect(cancelled).toBe(true)
})

test('Expired proposal disables accept using the server deadline', async ({ page }) => {
  await page.route('**/api/matchmaking/rank/status', route => route.fulfill({ json: {
    status: 'PROPOSED', proposalId, acceptDeadline: new Date(Date.now() - 1000).toISOString(),
  } }))
  await page.goto('/ranked')
  await expect(page.getByRole('button', { name: 'Chấp nhận trận' })).toBeDisabled()
})

async function openLobbyDuringMatch(page) {
  await page.route('**/api/game/**', route => route.fulfill({ status: 404, json: { message: 'Không tìm thấy bàn chơi.' } }))
  await page.goto('/lobby')
  await expect(page).toHaveURL(new RegExp(`/table/${tableId}$`))
  await page.getByRole('button', { name: 'Lobby', exact: true }).click()
  await expect(page).toHaveURL(/\/lobby$/)
  return page.getByTestId('matchmaking-card')
}

test('Normal match in progress offers a way back to the table or a forfeit from the lobby', async ({ page }) => {
  let queue = { status: 'READY', tableId }
  let leaveMethod
  await page.route('**/api/matchmaking/normal/status', route => route.fulfill({ json: queue }))
  const card = await openLobbyDuringMatch(page)
  await page.route(`**/api/game/tables/${tableId}/leave`, route => {
    leaveMethod = route.request().method()
    queue = { status: 'NONE' }
    return route.fulfill({ status: 204 })
  })
  await expect(card.getByRole('heading', { name: 'Ván đấu đang diễn ra' })).toBeVisible()
  await card.getByRole('button', { name: 'Quay lại bàn' }).click()
  await expect(page).toHaveURL(new RegExp(`/table/${tableId}$`))
  await page.getByRole('button', { name: 'Lobby', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Bạn đang trong một ván đấu' })).toBeVisible()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Rời ván' }).click()
  await expect(page.getByRole('button', { name: 'Chơi nhanh' })).toBeVisible()
  expect(leaveMethod).toBe('POST')
})

test('Rank match in progress only offers a way back to the table', async ({ page }) => {
  await page.route('**/api/matchmaking/rank/status', route => route.fulfill({ json: { status: 'READY', tableId } }))
  const card = await openLobbyDuringMatch(page)
  await expect(card.getByRole('button', { name: 'Quay lại bàn' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Rời ván' })).toHaveCount(0)
})

async function openTable(page, snapshot) {
  await page.route('**/api/auth/ws-token', route => route.fulfill({ json: { result: { accessToken: 'socket-test', expiresAt: new Date(Date.now() + 60000).toISOString() } } }))
  await page.routeWebSocket('**/ws/game', ws => ws.onMessage(frame => { if (frame.toString().startsWith('CONNECT\n')) ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0') }))
  await page.route(`**/api/game/tables/${tableId}`, route => route.fulfill({ json: {
    tableId, matchId: proposalId, accountId: 'player', seats: [], board: [], pot: 0, street: 'PREFLOP', handNumber: 1,
    actorSeat: 0, dealerSeat: 0, legalActions: [], actionSequence: 1, callAmount: 0, minRaiseTo: 20, maxRaiseTo: 1000,
    serverTime: new Date().toISOString(), deadline: new Date(Date.now() + 30000).toISOString(), ...snapshot,
  } }))
  await page.goto(`/table/${tableId}`)
  await expect(page.getByText(`Table ${tableId.slice(-6)} · Hand 1`)).toBeVisible()
}

test('a running Normal table hides the lobby exits and forfeits through Leave', async ({ page }) => {
  let leaveMethod
  await page.route(`**/api/game/tables/${tableId}/leave`, route => { leaveMethod = route.request().method(); return route.fulfill({ status: 204 }) })
  await openTable(page, { mode: 'NORMAL' })
  await expect(page.getByRole('button', { name: 'Lobby', exact: true })).toHaveCount(0)
  await expect(page.getByRole('link', { name: /POKER/ })).toHaveCount(0)
  page.once('dialog', dialog => dialog.dismiss())
  await page.getByRole('button', { name: 'Rời ván' }).click()
  expect(leaveMethod).toBeUndefined()
  page.once('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Rời ván' }).click()
  await expect(page).toHaveURL(/\/lobby$/)
  expect(leaveMethod).toBe('POST')
})

test('a running Rank table offers no exit, and a finished table returns the lobby button', async ({ page }) => {
  await openTable(page, { mode: 'RANK' })
  await expect(page.getByRole('button', { name: 'Lobby', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Rời ván' })).toHaveCount(0)
  await page.unroute(`**/api/game/tables/${tableId}`)
  await openTable(page, { mode: 'NORMAL', street: 'FINISHED', placements: [{ accountId: 'player', place: 1, finalChips: 2000 }] })
  await expect(page.getByRole('button', { name: 'Lobby', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Rời ván' })).toHaveCount(0)
})
