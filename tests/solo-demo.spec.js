import { test, expect } from '@playwright/test'

test('one human can play a real hand against five local bots without backend access', async ({ page }) => {
  const gameRequests = []
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/api/**', route => {
    const path = new URL(route.request().url()).pathname
    if (!path.startsWith('/api/')) return route.fallback()
    if (!path.startsWith('/api/auth/')) gameRequests.push(path)
    return route.fulfill({ status: 503, json: { message: 'Backend deliberately unavailable in solo demo test.' } })
  })
  await page.goto('/auth')
  await page.getByRole('link', { name: 'Chơi thử 1 người với bot', exact: true }).click()
  await expect(page).toHaveURL(/\/demo$/)
  const game = page.frameLocator('iframe[title="Bàn poker chơi thử một người với bot"]')
  await expect(game.locator('#game-canvas')).toBeVisible()
  await expect.poll(async () => {
    const frame = page.frames().find(frame => frame.url().includes('/demo/poker.html'))
    return frame?.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.screen)
  }).toBe('table')
  await game.getByRole('button', { name: 'Tốc độ chia bài' }).click()
  await expect(game.getByTestId('action-bar')).toBeVisible({ timeout: 45000 })
  const frame = page.frames().find(frame => frame.url().includes('/demo/poker.html'))
  // HUD updates during the runner's task; diagnostics publish on the next render frame.
  await expect.poll(() => frame.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.table?.awaitingHero)).toBe(true)
  await game.locator('.action-call').click()
  await expect.poll(() => frame.evaluate(() => window.__THREE_GAME_DIAGNOSTICS__?.table?.awaitingHero)).toBe(false)
  await page.screenshot({ path: 'artifacts/solo-demo-desktop.png', fullPage: true })
  expect(gameRequests).toEqual([])
  expect(errors).toEqual([])
})
