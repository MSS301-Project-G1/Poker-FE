import { test, expect } from '@playwright/test'

const proposalId = '00000000-0000-0000-0000-000000000010'
const tableId = '00000000-0000-0000-0000-000000000020'
test.beforeEach(async ({ page }) => {
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
  await page.getByRole('button', { name: 'Find match' }).click()
  await expect(page.getByRole('heading', { name: 'Looking for players' })).toBeVisible()
  expect(joinHeaders['x-xsrf-token']).toBe('test-csrf')
  expect(joinHeaders['x-user-id']).toBeUndefined()
  queue = { status: 'PROPOSED', proposalId, acceptDeadline: new Date(Date.now() + 10000).toISOString() }
  await page.getByRole('button', { name: 'Accept match' }).click()
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
  await page.getByRole('button', { name: 'Find match' }).click()
  await page.getByRole('button', { name: 'Cancel queue' }).click()
  await expect(page).toHaveURL(/\/lobby$/)
  expect(cancelled).toBe(true)
})

test('Expired proposal disables accept using the server deadline', async ({ page }) => {
  await page.route('**/api/matchmaking/rank/status', route => route.fulfill({ json: {
    status: 'PROPOSED', proposalId, acceptDeadline: new Date(Date.now() - 1000).toISOString(),
  } }))
  await page.goto('/ranked')
  await expect(page.getByRole('button', { name: 'Accept match' })).toBeDisabled()
})
