import { expect, test } from '@playwright/test'

const adminId = '00000000-0000-4000-8000-000000000001'
const userId = '00000000-0000-4000-8000-000000000002'
const email = 'player@example.test'
const pageOf = content => ({ content, page: 0, size: 20, totalPages: content.length ? 1 : 0, totalElements: content.length })

async function setup(page, initiallyBanned = false) {
  const state = { bannedActor: false, writes: [], history: [], refreshes: 0, queries: [], moderations: [], moderationHistory: [], eloWrites: [], eloHistory: [] }
  const standing = { seasonId: 'season-1', position: 3, accountId: userId, elo: 120, peakElo: 140, tier: 'IRON',
    winStreak: 1, lossStreak: 0, matchesPlayed: 4, lastMatchAt: null }
  const admin = { accountId: adminId, email: 'admin@example.test', displayName: 'Admin', role: 'ADMIN', emailVerified: true, banned: false }
  const player = { accountId: userId, email, displayName: 'Test player', playerCode: 'PLAYER0001', role: 'USER', emailVerified: true, banned: initiallyBanned }
  const details = user => ({ fullName: 'Test Player', bio: 'Hello there', customAvatar: false, accountStatus: 'ACTIVE',
    createdAt: '2026-11-01T00:00:00Z', ...user })
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
    if (path === '/api/auth/session') return state.bannedActor ? reply({ code: 'AUTH_ACCOUNT_BANNED', message: 'Account locked. Please contact an admin.' }, 403) : reply({ result: {} })
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
    if (path === `/api/admin/users/${userId}/details`) return reply({ result: details(player) })
    if (path === `/api/admin/users/${adminId}/details`) return reply({ result: details(admin) })
    if (path === `/api/admin/users/${userId}/moderation` && request.method() === 'POST') {
      const body = request.postDataJSON()
      state.moderations.push({ body, headers: request.headers() })
      state.moderationHistory.unshift({ id: String(state.moderationHistory.length + 1), accountId: userId, actorId: adminId,
        action: body.action, reason: body.reason, previousValue: player.displayName, occurredAt: new Date().toISOString() })
      player.displayName = `Player ${player.playerCode}`
      return reply({ result: details(player) })
    }
    if (path === `/api/admin/users/${userId}/moderation`) return reply({ result: pageOf(state.moderationHistory) })
    if (path.startsWith('/api/admin/users/') && (path.endsWith('/moderation') || path.endsWith('/bans'))) return reply({ result: pageOf([]) })
    if (path.startsWith('/api/ranking/players/')) return reply({ ...standing })
    if (path === `/api/admin/seasons/players/${userId}/elo` && request.method() === 'PUT') {
      const body = request.postDataJSON()
      state.eloWrites.push(body)
      state.eloHistory.unshift({ id: String(state.eloHistory.length + 1), seasonId: 'season-1', accountId: userId, actorId: adminId,
        eloBefore: standing.elo, eloAfter: body.elo, reason: body.reason, occurredAt: new Date().toISOString() })
      Object.assign(standing, { elo: body.elo, peakElo: Math.max(standing.peakElo, body.elo) })
      return reply({ ...standing })
    }
    if (path.endsWith('/elo-adjustments')) return reply(pageOf(path.includes(userId) ? state.eloHistory : []))
    if (path === '/api/game/matches') return reply(pageOf([{ id: 'match-1', mode: 'RANK', status: 'FINISHED',
      startedAt: '2026-11-12T08:00:00Z', placements: [{ accountId: adminId, place: 1 }, { accountId: userId, place: 2 }] }]))
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
  await expect(page.getByRole('heading', { name: 'Users', exact: true })).toBeVisible()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toBeVisible()
  return state
}

test('admin confirms a permanent ban with a reason and the client sends the cookie-security headers', async ({ page }) => {
  const state = await setup(page)
  await expect(page.getByRole('row', { name: /admin@example.test/ }).getByRole('button', { name: 'Ban', exact: true })).toBeDisabled()
  await page.getByLabel('Search users').fill(email)
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect.poll(() => state.queries.at(-1).get('keyword')).toBe(email)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Ban', exact: true }).click()
  await page.getByRole('button', { name: 'Confirm ban', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Enter a reason')
  expect(state.writes).toHaveLength(0)
  await page.getByLabel('Reason', { exact: true }).fill('  Repeated abuse  ')
  await page.getByRole('button', { name: 'Confirm ban', exact: true }).click()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toContainText('Banned')
  expect(state.writes).toHaveLength(1)
  expect(state.writes[0].body).toEqual({ reason: 'Repeated abuse', until: null })
  expect(state.writes[0].headers['x-xsrf-token']).toBe('ban-test-csrf')
  expect(state.writes[0].headers['x-tab-id']).toMatch(/^[0-9a-f-]{36}$/)
  expect(state.writes[0].headers['x-user-id']).toBeUndefined()
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Details', exact: true }).click()
  await expect(page).toHaveURL(new RegExp(`/admin/users/${userId}$`))
  await expect(page.getByRole('region', { name: 'Account history' })).toContainText('Repeated abuse')
})

test('details show the whole account and every moderation action asks for a reason', async ({ page }) => {
  const state = await setup(page)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Details', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Profile', exact: true })).toContainText('Test Player')
  await expect(page.getByRole('region', { name: 'Profile', exact: true })).toContainText('Hello there')
  await expect(page.getByRole('region', { name: 'Game', exact: true })).toContainText('120 (peak 140)')
  await expect(page.getByRole('region', { name: 'Game', exact: true })).toContainText('RANK · place 2/2')
  await expect(page.getByRole('button', { name: 'Resend verification email' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Remove avatar' })).toBeDisabled()

  await page.getByRole('button', { name: 'Reset display name' }).click()
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Enter a reason')
  expect(state.moderations).toHaveLength(0)
  await page.getByLabel('Reason', { exact: true }).fill('  Offensive name  ')
  await page.getByRole('button', { name: 'Confirm', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Player PLAYER0001')
  expect(state.moderations[0].body).toEqual({ action: 'RESET_DISPLAY_NAME', reason: 'Offensive name' })
  expect(state.moderations[0].headers['x-xsrf-token']).toBe('ban-test-csrf')
  await expect(page.getByRole('region', { name: 'Moderation history' })).toContainText('Before: Test player')
  await expect(page.getByRole('button', { name: 'Reset display name' })).toBeDisabled()
})

test('admin sets the Elo with a reason and the change shows in the Elo history', async ({ page }) => {
  const state = await setup(page)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Details', exact: true }).click()
  await page.getByRole('button', { name: 'Adjust Elo' }).click()
  await page.getByLabel('New Elo', { exact: true }).fill('900')
  await page.getByRole('button', { name: 'Save Elo', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Enter a reason')
  expect(state.eloWrites).toHaveLength(0)
  await page.getByLabel('Reason', { exact: true }).fill('  Server crash compensation  ')
  await page.getByRole('button', { name: 'Save Elo', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Game', exact: true })).toContainText('900 (peak 900)')
  expect(state.eloWrites).toEqual([{ elo: 900, reason: 'Server crash compensation' }])
  await expect(page.getByRole('region', { name: 'Elo history' })).toContainText('Elo 120 → 900')
  await expect(page.getByRole('region', { name: 'Elo history' })).toContainText('Server crash compensation')
})

test('ADMIN accounts open read-only details', async ({ page }) => {
  const state = await setup(page)
  await page.getByRole('row', { name: /admin@example.test/ }).getByRole('button', { name: 'Details', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Moderation', exact: true })).toContainText('can’t be moderated')
  await expect(page.getByRole('button', { name: 'Sign out everywhere' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Adjust Elo' })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Ban', exact: true })).toBeDisabled()
  expect(state.moderations).toHaveLength(0)
})

test('timed bans reject a past deadline in FE and send a future ISO instant to BE', async ({ page }) => {
  const state = await setup(page)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Ban', exact: true }).click()
  await page.getByLabel('Reason', { exact: true }).fill('Temporary ban')
  await page.getByLabel('Duration', { exact: true }).selectOption('timed')
  await page.getByLabel('Ban until', { exact: true }).fill('2020-01-01T00:00')
  await page.getByRole('button', { name: 'Confirm ban', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('must be in the future')
  expect(state.writes).toHaveLength(0)
  const nextDay = new Date(Date.now() + 86400000).toISOString().slice(0, 16)
  await page.getByLabel('Ban until', { exact: true }).fill(nextDay)
  await page.getByRole('button', { name: 'Confirm ban', exact: true }).click()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toContainText('Banned')
  expect(Date.parse(state.writes[0].body.until)).toBeGreaterThan(Date.now())
  expect(state.writes[0].body.until).toMatch(/Z$/)
})

test('admin explicitly confirms unban and the history records its reason', async ({ page }) => {
  const state = await setup(page, true)
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Unban', exact: true }).click()
  expect(state.writes).toHaveLength(0)
  await page.getByLabel('Reason', { exact: true }).fill('Appeal accepted')
  await page.getByRole('button', { name: 'Confirm unban', exact: true }).click()
  await expect(page.getByRole('row', { name: /player@example.test/ })).toContainText('Not banned')
  expect(state.writes[0].path).toBe(`/api/admin/users/${userId}/unban`)
  expect(state.writes[0].body).toEqual({ reason: 'Appeal accepted' })
  await page.getByRole('row', { name: /player@example.test/ }).getByRole('button', { name: 'Details', exact: true }).click()
  await expect(page.getByRole('region', { name: 'Account history' })).toContainText('Appeal accepted')
})

test('a ban response locks the whole app without refreshing and allows signing in to another account', async ({ page }) => {
  const state = await setup(page)
  state.bannedActor = true
  await page.evaluate(() => window.dispatchEvent(new Event('focus')))
  await expect(page.getByRole('heading', { name: 'Account locked', exact: true })).toBeVisible()
  await expect(page.getByLabel('Search users')).toHaveCount(0)
  expect(state.refreshes).toBe(0)
  await page.getByRole('button', { name: 'Sign in with another account', exact: true }).click()
  await expect(page.getByLabel('Email address')).toBeVisible()
})
