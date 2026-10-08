import { test, expect } from '@playwright/test'

const backend = 'http://127.0.0.1:8082'

async function create(request, humans = 2, bots = 0) {
  const response = await request.post(`${backend}/dev/tables?humans=${humans}&bots=${bots}`)
  expect(response.ok()).toBeTruthy()
  return response.json()
}

test('local launcher creates a real table and joins the live game', async ({ page }, testInfo) => {
  await page.goto('/table')
  await expect(page.getByRole('heading', { name: 'No active table' })).toBeVisible()
  await page.getByRole('button', { name: 'Create local table' }).click()
  await page.getByRole('button', { name: 'Join table' }).click()
  await expect(page.getByText('LIVE', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Your cards')).toBeVisible()
  await expect(page.getByLabel('Your cards').getByLabel('Hidden card')).toHaveCount(0)
  await page.screenshot({ path: testInfo.outputPath('table-desktop.png'), fullPage: true })
})

test('a call updates both players and reload reconnects without exposing hole cards', async ({ page, browser, request }) => {
  const table = await create(request)
  const otherContext = await browser.newContext()
  const other = await otherContext.newPage()
  try {
    await page.goto(`/table/${table.tableId}?devUser=${table.humanIds[0]}`)
    await other.goto(`/table/${table.tableId}?devUser=${table.humanIds[1]}`)
    await expect(page.getByText('LIVE', { exact: true })).toBeVisible()
    await expect(other.getByText('LIVE', { exact: true })).toBeVisible()
    const cards = await page.getByLabel('Your cards').textContent()
    await expect(page.getByLabel('Hidden card')).toHaveCount(2)
    await page.getByRole('button', { name: /^CALL/ }).click()
    await expect(page.getByRole('button', { name: /^CALL/ })).toBeDisabled()
    await expect(other.getByRole('button', { name: /^CHECK/ })).toBeEnabled()
    await page.reload()
    await expect(page.getByText('LIVE', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Your cards')).toHaveText(cards)
    await expect(page.getByLabel('Hidden card')).toHaveCount(2)
  } finally { await otherContext.close() }
})

test('playing a full heads-up match displays server placements', async ({ page, browser, request }) => {
  const table = await create(request)
  const otherContext = await browser.newContext()
  const other = await otherContext.newPage()
  const snapshot = async () => (await request.get(`${backend}/api/game/tables/${table.tableId}`, { headers: { 'X-Dev-User': table.humanIds[0] } })).json()
  try {
    await page.goto(`/table/${table.tableId}?devUser=${table.humanIds[0]}`)
    await other.goto(`/table/${table.tableId}?devUser=${table.humanIds[1]}`)
    await expect(page.getByText('LIVE', { exact: true })).toBeVisible()
    await expect(other.getByText('LIVE', { exact: true })).toBeVisible()
    for (let action = 0; action < 20; action++) {
      const state = await snapshot()
      if (state.street === 'FINISHED') break
      if (state.street === 'HAND_FINISHED') {
        await expect.poll(async () => (await snapshot()).street, { timeout: 10000 }).not.toBe('HAND_FINISHED')
        continue
      }
      const actorId = state.seats[state.actorSeat].accountId
      const actorPage = actorId === table.humanIds[0] ? page : other
      const allIn = actorPage.getByRole('button', { name: /^ALL-IN/ })
      if (await allIn.isEnabled()) await allIn.click()
      else await actorPage.getByRole('button', { name: /^CALL/ }).click()
      await expect.poll(async () => (await snapshot()).actionSequence).toBeGreaterThan(state.actionSequence)
    }
    const results = page.getByRole('dialog', { name: 'Match results' })
    await expect(results).toBeVisible()
    await expect(results.getByRole('row')).toHaveCount(3)
    await expect(results.getByRole('button', { name: 'Back to lobby' })).toBeVisible()
  } finally { await otherContext.close() }
})

test('mobile table fits the viewport and keeps actions visible', async ({ page, request }, testInfo) => {
  const table = await create(request, 1, 5)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto(`/table/${table.tableId}?devUser=${table.humanIds[0]}`)
  await expect(page.getByText('LIVE', { exact: true })).toBeVisible()
  await expect(page.getByLabel('Poker actions')).toBeVisible()
  const width = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: window.innerWidth }))
  expect(width.content).toBeLessThanOrEqual(width.viewport)
  await page.screenshot({ path: testInfo.outputPath('table-mobile.png'), fullPage: true })
})

test('admin saves settings and the server retains them after reload', async ({ page, request }) => {
  const table = await create(request)
  const headers = { 'X-Dev-User': table.humanIds[0] }
  const initial = await (await request.get(`${backend}/api/admin/match-settings`, { headers })).json()
  const original = initial.find(setting => setting.mode === 'NORMAL')
  try {
    await page.goto(`/admin/match-settings?devUser=${table.humanIds[0]}`)
    await expect(page.getByRole('heading', { name: 'Match settings', exact: true })).toBeVisible()
    await page.getByLabel('NORMAL Turn time (seconds)').fill('21')
    await page.getByRole('button', { name: 'Save NORMAL', exact: true }).click()
    await expect(page.getByText('Saved. Future tables will use these settings.')).toBeVisible()
    await page.reload()
    await expect(page.getByLabel('NORMAL Turn time (seconds)')).toHaveValue('21')
  } finally {
    await request.put(`${backend}/api/admin/match-settings/NORMAL`, { headers, data: {
      settings: { smallBlind: original.smallBlind, bigBlind: original.bigBlind, startingChips: original.startingChips, turnTimeSeconds: original.turnTimeSeconds }, minPlayers: original.minPlayers, maxPlayers: original.maxPlayers,
    } })
  }
})
