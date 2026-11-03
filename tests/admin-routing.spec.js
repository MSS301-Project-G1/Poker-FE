import { expect, test } from '@playwright/test'

const accountId = '00000000-0000-4000-8000-000000000001'
const tableId = '00000000-0000-4000-8000-000000000002'
const adminPaths = ['/admin', '/admin/users', '/admin/avatars', '/admin/shop', '/admin/seasons', '/admin/tournaments', '/admin/match-settings', '/admin/unknown']

async function fixture(page, { role = 'ADMIN', signedIn = true, activeTable = null } = {}) {
  const state = { signedIn, requests: [] }
  const user = { accountId, email: 'account@example.test', role, profile: { displayName: 'Player' } }
  const headers = { 'Access-Control-Allow-Origin': 'http://localhost:5187', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': 'Content-Type,X-Tab-Id,X-XSRF-TOKEN' }
  await page.addInitScript(() => sessionStorage.setItem('poker.lobby.checkInDismissed', 'true'))
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (!path.startsWith('/api/')) return route.fallback()
    const reply = (json, status = 200) => route.fulfill({ status, headers, json })
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    state.requests.push(path)
    if (path === '/api/auth/csrf') return reply({ result: { token: 'routing-csrf' } })
    if (path === '/api/auth/session/claim' || path === '/api/auth/session') return state.signedIn
      ? reply({ result: { accountId } }) : reply({ code: 'AUTH_REFRESH_INVALID', message: 'Sign in again.' }, 401)
    if (path === '/api/auth/login') { state.signedIn = true; return reply({ result: { accountId } }) }
    if (path === '/api/auth/logout') { state.signedIn = false; return reply({ code: 'success_request' }) }
    if (path === '/api/auth/me') return reply({ result: user })
    if (path === '/api/game/me/active-table') return role === 'ADMIN'
      ? reply({ message: 'The game is deliberately unavailable for admin routing.' }, 503) : reply(activeTable ? { tableId: activeTable } : null)
    if (path === '/api/auth/ws-token') return reply({ message: 'Realtime is outside this routing test.' }, 503)
    if (path === '/api/admin/users') return reply({ result: { content: [], page: 0, size: 20, totalPages: 0, totalElements: 0 } })
    if (path === '/api/profiles/me') return reply({ result: { accountId, email: user.email, displayName: 'Player' } })
    if (path === '/api/profiles/avatars') return reply({ result: [] })
    if (path === '/api/wallet/me') return reply({ data: { coinBalance: 0, vipCoinBalance: 0 } })
    if (path === '/api/party/me') return reply(null)
    if (path.endsWith('/status')) return reply({ status: 'NONE' })
    return reply({ items: [], page: 0, size: 20, totalPages: 0, totalElements: 0 })
  })
  return state
}

async function signIn(page) {
  await page.getByLabel('Email address').fill('account@example.test')
  await page.getByLabel(/^Password/).fill('Poker123!')
  await page.getByRole('button', { name: 'ENTER ARENA', exact: true }).click()
}

test('ADMIN signs into the dedicated area without depending on the game, wallet or player queue', async ({ page }) => {
  const state = await fixture(page, { signedIn: false })
  await page.goto('/auth')
  await signIn(page)
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Quản trị hệ thống', exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Điều hướng quản trị' })).toBeVisible()
  expect(state.requests.filter(path => path.startsWith('/api/game/') || path.startsWith('/api/wallet/')
    || path.startsWith('/api/matchmaking/') || path.startsWith('/api/party/') || path === '/api/auth/ws-token')).toEqual([])
})

test('a saved lobby destination cannot send ADMIN back to the player lobby after login', async ({ page }) => {
  await fixture(page, { signedIn: false })
  await page.goto('/lobby')
  await expect(page).toHaveURL(/\/auth$/)
  await signIn(page)
  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: 'Quản trị hệ thống', exact: true })).toBeVisible()
})

test('the admin home exposes the existing modules and links to user management', async ({ page }) => {
  await fixture(page)
  await page.goto('/admin')
  const modules = page.getByRole('navigation', { name: 'Chức năng quản trị' })
  for (const path of adminPaths.slice(1, 7)) await expect(modules.locator(`a[href="${path}"]`)).toBeVisible()
  await page.screenshot({ path: '/tmp/poker-admin-home.png', fullPage: true })
  await modules.getByRole('link', { name: /Người dùng/ }).click()
  await expect(page).toHaveURL(/\/admin\/users$/)
  await expect(page.getByRole('heading', { name: 'Người dùng', exact: true })).toBeVisible()
})

test('USER sees 404 on every admin route, including unknown paths, and makes no admin API calls', async ({ page }) => {
  const state = await fixture(page, { role: 'USER' })
  for (const path of adminPaths) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: '404 · Không tìm thấy trang', exact: true })).toBeVisible()
    await expect(page.getByRole('navigation', { name: 'Điều hướng quản trị' })).toHaveCount(0)
    expect(new URL(page.url()).pathname).toBe(path)
  }
  expect(state.requests.filter(path => path.startsWith('/api/admin/'))).toEqual([])
})

test('a guest sees 404 instead of the admin screen or an admin login redirect', async ({ page }) => {
  const state = await fixture(page, { signedIn: false })
  for (const path of ['/admin', '/admin/users', '/admin/shop/products/new']) {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: '404 · Không tìm thấy trang', exact: true })).toBeVisible()
    expect(new URL(page.url()).pathname).toBe(path)
  }
  expect(state.requests.filter(path => path.startsWith('/api/admin/'))).toEqual([])
})

test('USER still returns to a protected player destination after signing in', async ({ page }) => {
  await fixture(page, { role: 'USER', signedIn: false })
  await page.goto('/account')
  await expect(page).toHaveURL(/\/auth$/)
  await signIn(page)
  await expect(page).toHaveURL(/\/account$/)
  await expect(page.getByRole('heading', { name: 'Profile & security', exact: true })).toBeVisible()
})

test('USER still resumes an existing table before opening a player screen', async ({ page }) => {
  await fixture(page, { role: 'USER', activeTable: tableId })
  await page.goto('/account')
  await expect(page).toHaveURL(new RegExp(`/table/${tableId}$`))
  await expect(page.getByRole('navigation', { name: 'Điều hướng quản trị' })).toHaveCount(0)
})

test('ADMIN can sign out from the dedicated layout', async ({ page }) => {
  const state = await fixture(page)
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Quản trị hệ thống', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
  await expect(page).toHaveURL(/\/auth$/)
  await expect(page.getByLabel('Email address')).toBeVisible()
  expect(state.signedIn).toBe(false)
})
