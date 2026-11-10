import { expect, test } from '@playwright/test'

const adminId = '00000000-0000-4000-8000-000000000001'
const userId = '00000000-0000-4000-8000-000000000002'
const email = 'player@example.test'
const pageOf = content => ({ content, page: 0, size: 20, totalPages: content.length ? 1 : 0, totalElements: content.length })

async function setup(page, initiallyBanned = false) {
  const state = { bannedActor: false, writes: [], history: [], refreshes: 0, queries: [] }
  const admin = { accountId: adminId, email: 'admin@example.test', displayName: 'Admin', role: 'ADMIN', emailVerified: true, banned: false }
  const player = { accountId: userId, email, displayName: 'Test player', playerCode: 'PLAYER0001', role: 'USER', emailVerified: true, banned: initiallyBanned }
  const headers = { 'Access-Control-Allow-Origin': 'http://localhost:5187', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type,X-Tab-Id,X-XSRF-TOKEN' }
  await page.route('**/api/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (!path.startsWith('/api/')) return route.fallback()
    const reply = (body, status = 200) => route.fulfill({ status, headers, json: body })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (path === '/api/auth/csrf') return reply({ result: { token: 'ban-test-csrf' } })
    if (path === '/api/auth/session/claim') return reply({ result: { accountId: adminId } })
    if (path === '/api/auth/session') return state.bannedActor ? reply({ code: 'AUTH_ACCOUNT_BANNED', message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.' }, 403) : reply({ result: {} })
    if (path === '/api/auth/refresh') { state.refreshes++; return reply({ result: {} }) }
    if (path === '/api/auth/me') return reply({ result: { ...admin, profile: { displayName: 'Admin' } } })
    if (path === '/api/auth/ws-token') return reply({ message: 'Sockets are outside this UI test.' }, 503)
    if (path === '/api/game/me/active-table') return reply(null)
    if (path === '/api/admin/users') {
      state.queries.push(url.searchParams)
      const keyword = url.searchParams.get('keyword') || ''
      const banned = url.searchParams.get('banned')
      return reply({ result: pageOf([admin, player].filter(user => user.email.includes(keyword)
        && (banned === null || String(user.banned) === banned))) })
    }
    if (path === `/api/admin/users/${userId}`) return reply({ result: player })
    if (path === `/api/admin/users/${userId}/bans`) return reply({ result: pageOf(state.history) })
    if (path === `/api/admin/users/${userId}/ban` || path === `/api/admin/users/${userId}/unban`) {
      const body = request.postDataJSON()
      const banning = path.endsWith('/ban')
      state.writes.push({ body, headers: request.headers(), path })
      player.banned = banning
      player.banReason = banning ? body.reason : null
      player.bannedUntil = banning ? body.until : null
      state.history.unshift({ id: String(state.history.length + 1), accountId: userId, actorId: adminId,
        action: banning ? 'BAN' : 'UNBAN', reason: body.reason, until: body.until,
        occurredAt: new Date().toISOString() })
      return reply({ result: player })
    }
    if (path === '/api/party/me') return reply(null)
    if (path.endsWith('/status')) return reply({ status: 'NONE' })
    return reply({ items: [], page: 0, size: 20, totalPages: 0, totalElements: 0 })
  })
  await page.goto('/admin/users')
  await expect(page.getByRole('heading', { name: 'Người dùng', exact: true })).toBeVisible()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toBeVisible()
  return state
}

test('admin confirms a permanent ban with a reason and the client sends the cookie-security headers', async ({ page }) => {
  const state = await setup(page)
  await expect(page.getByRole('row', { name: /admin@example.test/ }).getByRole('button', { name: 'Khóa', exact: true })).toBeDisabled()
  await page.getByLabel('Tìm người dùng').fill(email)
  await page.getByRole('button', { name: 'Tìm kiếm', exact: true }).click()
  await expect.poll(() => state.queries.at(-1).get('keyword')).toBe(email)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Khóa', exact: true }).click()
  await page.getByRole('button', { name: 'Xác nhận khóa', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Nhập lý do')
  expect(state.writes).toHaveLength(0)
  await page.getByLabel('Lý do', { exact: true }).fill('  Repeated abuse  ')
  await page.getByRole('button', { name: 'Xác nhận khóa', exact: true }).click()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toContainText('Đang khóa')
  expect(state.writes).toHaveLength(1)
  expect(state.writes[0].body).toEqual({ reason: 'Repeated abuse', until: null })
  expect(state.writes[0].headers['x-xsrf-token']).toBe('ban-test-csrf')
  expect(state.writes[0].headers['x-tab-id']).toMatch(/^[0-9a-f-]{36}$/)
  expect(state.writes[0].headers['x-user-id']).toBeUndefined()
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Chi tiết', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Lịch sử tài khoản' })).toContainText('Repeated abuse')
})

test('timed bans reject a past deadline in FE and send a future ISO instant to BE', async ({ page }) => {
  const state = await setup(page)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Khóa', exact: true }).click()
  await page.getByLabel('Lý do', { exact: true }).fill('Temporary ban')
  await page.getByLabel('Thời hạn', { exact: true }).selectOption('timed')
  await page.getByLabel('Khóa đến', { exact: true }).fill('2020-01-01T00:00')
  await page.getByRole('button', { name: 'Xác nhận khóa', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('phải ở tương lai')
  expect(state.writes).toHaveLength(0)
  const nextDay = new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  await page.getByLabel('Khóa đến', { exact: true }).fill(nextDay)
  await page.getByRole('button', { name: 'Xác nhận khóa', exact: true }).click()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toContainText('Đang khóa')
  expect(Date.parse(state.writes[0].body.until)).toBeGreaterThan(Date.now())
  expect(state.writes[0].body.until).toMatch(/Z$/)
})

test('admin explicitly confirms unban and the history records its reason', async ({ page }) => {
  const state = await setup(page, true)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Gỡ khóa', exact: true }).click()
  expect(state.writes).toHaveLength(0)
  await page.getByLabel('Lý do', { exact: true }).fill('Appeal accepted')
  await page.getByRole('button', { name: 'Xác nhận gỡ khóa', exact: true }).click()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toContainText('Không bị khóa')
  expect(state.writes[0].path).toBe(`/api/admin/users/${userId}/unban`)
  expect(state.writes[0].body).toEqual({ reason: 'Appeal accepted' })
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Chi tiết', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Lịch sử tài khoản' })).toContainText('Appeal accepted')
})

test('a ban response locks the whole app without refreshing and allows signing in to another account', async ({ page }) => {
  const state = await setup(page)
  state.bannedActor = true
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('heading', { name: 'Tài khoản đã bị khóa', exact: true })).toBeVisible()
  await expect(page.getByLabel('Tìm người dùng')).toHaveCount(0)
  expect(state.refreshes).toBe(0)
  await page.getByRole('button', { name: 'Đăng nhập tài khoản khác', exact: true }).click()
  await expect(page.getByLabel('Email address')).toBeVisible()
})
