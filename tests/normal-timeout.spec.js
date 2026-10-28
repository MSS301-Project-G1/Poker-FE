import { test, expect } from '@playwright/test'

test('two players who do not confirm a Normal proposal return to lobby and can search again', async ({ browser, baseURL }) => {
  test.setTimeout(120000)
  const ids = ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002']
  const proposalId = '00000000-0000-0000-0000-000000000010'
  const deadline = new Date(Date.now() + 90000).toISOString()
  const joinedAt = new Date().toISOString()
  let phase = 'PROPOSED'
  const joins = new Set()
  let accepts = 0
  const contexts = []
  try {
    const pages = await Promise.all(ids.map(async (id, index) => {
      const context = await browser.newContext({ baseURL, reducedMotion: 'reduce', viewport: { width: 1366, height: 768 } })
      contexts.push(context)
      await context.addInitScript(() => sessionStorage.setItem('poker.lobby.checkInDismissed', 'true'))
      // Exercise the supported no-WebGL fallback; this test covers queue state,
      // not rendering two GPU scenes in a headless browser.
      await context.addInitScript(() => {
        const getContext = HTMLCanvasElement.prototype.getContext
        HTMLCanvasElement.prototype.getContext = function (kind, ...args) {
          return kind.startsWith('webgl') ? null : getContext.call(this, kind, ...args)
        }
      })
      await context.route('**/api/**', route => {
        const path = new URL(route.request().url()).pathname
        if (!path.startsWith('/api/')) return route.fallback()
        if (path === '/api/auth/me') return route.fulfill({ json: { result: { accountId: id, email: `player${index}@example.test`, role: 'USER', profile: { displayName: `Player ${index + 1}` } } } })
        if (path === '/api/auth/csrf') return route.fulfill({ json: { result: { token: 'test-csrf' } } })
        if (path === '/api/party/me') return route.fulfill({ json: null })
        if (path === '/api/profiles/batch') return route.fulfill({ json: { result: ids.map((accountId, i) => ({ accountId, displayName: `Player ${i + 1}` })) } })
        if (path === '/api/matchmaking/normal/status') return route.fulfill({ json: joins.has(id)
          ? { status: 'WAITING', joinedAt, playerCount: 2, minPlayers: 2, maxPlayers: 6, playerIds: ids }
          : phase === 'NONE' ? { status: 'NONE' }
            : { status: 'PROPOSED', proposalId, playerIds: ids, playerCount: 2, maxPlayers: 6, acceptDeadline: phase === 'EXPIRED' ? '2020-01-01T00:00:00Z' : deadline } })
        if (path === '/api/matchmaking/rank/status') return route.fulfill({ json: { status: 'NONE' } })
        if (path === '/api/matchmaking/normal/join') { joins.add(id); return route.fulfill({ json: { status: 'WAITING' } }) }
        if (path.endsWith('/accept')) { accepts++; return route.fulfill({ json: {} }) }
        return route.fulfill({ json: { items: [], totalElements: 0, totalPages: 0 } })
      })
      const page = await context.newPage()
      await page.goto('/ranked?mode=NORMAL')
      await expect(page.getByRole('button', { name: 'Chấp nhận trận', exact: true })).toBeVisible()
      return page
    }))
    phase = 'EXPIRED'
    for (const page of pages) await expect(page.getByRole('button', { name: 'Chấp nhận trận', exact: true })).toBeDisabled()
    phase = 'NONE'
    for (const page of pages) {
      await expect(page).toHaveURL(/\/lobby$/)
      await expect(page.getByText('Trận đã hủy vì hết thời gian xác nhận hoặc có người từ chối. Bạn có thể tìm trận mới.', { exact: true })).toBeVisible()
    }
    expect(accepts).toBe(0)
    expect(joins.size).toBe(0)
    for (const page of pages) {
      await page.getByRole('button', { name: 'Chơi Poker', exact: true }).click()
      await page.getByRole('button', { name: 'Chơi nhanh', exact: true }).click()
      await expect(page).toHaveURL(/\/ranked\?mode=NORMAL$/)
      await expect(page.getByRole('button', { name: 'Hủy tìm trận', exact: true })).toBeVisible()
    }
    expect(joins.size).toBe(2)
  } finally { await Promise.all(contexts.map(context => context.close())) }
})
