import { expect, test } from '@playwright/test'

const accountId = '00000000-0000-4000-8000-000000000001'
const id = '00000000-0000-4000-8000-000000000002'
const bundleId = '00000000-0000-4000-8000-000000000003'

async function fixture(page, changes = {}) {
  const state = {
    order: { id, accountId, bundleId, bundleName: 'Test pack', vipCoinAmount: 55000, amountVnd: 50000,
      payosOrderCode: 123456, checkoutUrl: 'https://checkout.example.test/order', qrCode: '000201010212-provider-payload',
      expiresAt: new Date(Date.now() + 300000).toISOString(), status: 'PENDING', fulfillmentStatus: 'PENDING', ...changes },
    reads: 0, writes: 0, cancelPaid: false, detailUnavailable: false, pendingCalls: 0,
  }
  const headers = { 'Access-Control-Allow-Origin': 'http://localhost:5193', 'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type,X-Tab-Id,X-XSRF-TOKEN' }
  await page.addInitScript(() => sessionStorage.setItem('poker.lobby.checkInDismissed', 'true'))
  await page.route('**/api/**', async route => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    if (!path.startsWith('/api/')) return route.fallback()
    const reply = (json, status = 200) => route.fulfill({ status, headers, json })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (path === '/api/auth/csrf') return reply({ result: { token: 'payment-fixture-csrf' } })
    if (path === '/api/auth/session/claim' || path === '/api/auth/session') return reply({ result: { accountId } })
    if (path === '/api/auth/me') return reply({ result: { accountId, role: 'USER', email: 'payment@example.test', profile: { displayName: 'Player' } } })
    if (path === '/api/game/me/active-table' || path === '/api/party/me') return reply(null)
    if (path === '/api/auth/ws-token') return reply({ message: 'Realtime is outside this payment UI test.' }, 503)
    if (path === '/api/wallet/me') return reply({ data: { coinBalance: 100, vipCoinBalance: state.order.fulfillmentStatus === 'FULFILLED' ? 55000 : 0 } })
    if (path === '/api/shop/bundles') return reply({ data: [
      { id: bundleId, name: 'Test pack', priceVnd: 50000, totalVipCoin: 55000 },
      { id: 'different-pack', name: 'Another pack', priceVnd: 100000, totalVipCoin: 110000 },
    ] })
    if (path === '/api/payments/orders/me') return reply({ data: [state.order] })
    if (path === '/api/payments/orders/pending') {
      state.pendingCalls++
      return reply({ data: state.order.status === 'PENDING' ? state.order : null })
    }
    if (path === `/api/payments/orders/${id}` || path === `/api/payments/orders/${id}/sync`) {
      state.reads++
      return state.detailUnavailable ? reply({ code: 'UNAVAILABLE', message: 'Payment service unavailable.' }, 503) : reply({ data: state.order })
    }
    if (path === `/api/payments/orders/${id}/cancel`) {
      state.order = { ...state.order, status: state.cancelPaid ? 'PAID' : 'CANCELLED' }
      return reply({ data: state.order })
    }
    if (path.includes('/api/payments/bundles/') && path.endsWith('/orders')) { state.writes++; return reply({ data: state.order }) }
    if (path.endsWith('/status')) return reply({ status: 'NONE' })
    return reply({ items: [], content: [], page: 0, totalElements: 0 })
  })
  return state
}

test('redirect query cannot confirm payment, and the page follows only its matching order', async ({ page }) => {
  const state = await fixture(page)
  await page.goto('/shop/payment/success?code=00&status=PAID&orderCode=123456')
  await expect(page.getByRole('heading', { name: 'Awaiting payment', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Payment complete', exact: true })).toHaveCount(0)
  expect(state.pendingCalls).toBe(0)
  await page.goto('/shop/payment/success?code=00&status=PAID&orderCode=999999')
  await expect(page.getByRole('heading', { name: 'Payment not confirmed', exact: true })).toBeVisible()
})

test('PAID stays processing until delivery is FULFILLED and then refreshes the wallet', async ({ page }) => {
  const state = await fixture(page, { status: 'PAID' })
  await page.goto('/shop/payment/success?orderCode=123456')
  await expect(page.getByRole('heading', { name: 'Payment received', exact: true })).toBeVisible()
  await expect(page.getByText('Your payment is confirmed. VIP Coin or item delivery is still processing.', { exact: false })).toBeVisible()
  state.order = { ...state.order, fulfillmentStatus: 'FULFILLED' }
  await expect(page.getByRole('heading', { name: 'Payment complete', exact: true })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('55,000 VIP Coin', { exact: true })).toBeVisible()
})

test('review-required payments stop polling and tell the user not to pay again', async ({ page }) => {
  const state = await fixture(page, { status: 'PAID', fulfillmentStatus: 'REVIEW_REQUIRED' })
  await page.goto('/shop/payment/success?orderCode=123456')
  await expect(page.getByRole('heading', { name: 'Payment needs review', exact: true })).toBeVisible()
  await expect(page.getByText(/Do not pay this order again/)).toBeVisible()
  const reads = state.reads
  await page.waitForTimeout(4500)
  expect(state.reads).toBe(reads)
  await expect(page.getByRole('button', { name: 'Choose another pack' })).toHaveCount(0)
})

test('overdue pending order stays visible for confirmation without a payment QR', async ({ page }) => {
  const state = await fixture(page, { expiresAt: new Date(Date.now() - 60000).toISOString() })
  await page.goto('/shop/bundles')
  const dialog = page.getByRole('dialog', { name: 'Confirming payment status' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img')).toHaveCount(0)
  await expect(dialog.getByRole('button', { name: 'Open checkout' })).toHaveCount(0)
  state.order = { ...state.order, status: 'PAID', fulfillmentStatus: 'FULFILLED' }
  await dialog.getByRole('button', { name: 'Check payment status' }).click()
  await expect(page.getByRole('dialog', { name: 'Payment complete' })).toBeVisible()
})

test('a cancel response that is PAID keeps the order open as processing', async ({ page }) => {
  const state = await fixture(page)
  state.cancelPaid = true
  await page.goto('/shop/bundles')
  const dialog = page.getByRole('dialog', { name: 'Awaiting payment' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByRole('img', { name: 'Payment QR for this order' })).toHaveAttribute('src', /^data:image\/png/)
  await dialog.getByRole('button', { name: 'Cancel this order', exact: true }).click()
  await expect(page.getByRole('dialog', { name: 'Payment received' })).toBeVisible()
  expect(state.writes).toBe(0)
})

test('switching packs does not start a new checkout when cancellation reports PAID', async ({ page }) => {
  const state = await fixture(page)
  state.cancelPaid = true
  await page.goto('/shop/bundles')
  await page.getByRole('button', { name: 'Close payment' }).click()
  await page.getByRole('button', { name: 'Top up', exact: true }).nth(1).click()
  await expect(page.getByRole('heading', { name: 'Order awaiting payment' })).toBeVisible()
  await page.getByRole('button', { name: /Cancel.*new pack/i }).click()
  await expect(page.getByRole('dialog', { name: 'Payment received' })).toBeVisible()
  expect(state.writes).toBe(0)
})

test('transient lookup failure preserves processing state and later recovers', async ({ page }) => {
  const state = await fixture(page, { status: 'PAID' })
  await page.goto('/shop/payment/success?orderCode=123456')
  await expect(page.getByRole('heading', { name: 'Payment received', exact: true })).toBeVisible()
  state.detailUnavailable = true
  await expect(page.getByRole('alert')).toContainText('Payment service unavailable.', { timeout: 10000 })
  await expect(page.getByRole('heading', { name: 'Payment received', exact: true })).toBeVisible()
  state.detailUnavailable = false
  state.order = { ...state.order, fulfillmentStatus: 'FULFILLED' }
  await page.getByRole('button', { name: 'Check again', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Payment complete', exact: true })).toBeVisible()
})

test('return without query parameters restores the account-scoped order reference', async ({ page }) => {
  await fixture(page, { status: 'PAID', fulfillmentStatus: 'FULFILLED' })
  await page.addInitScript(({ accountId, id }) => sessionStorage.setItem(`poker.payment.order.${accountId}`, id), { accountId, id })
  await page.goto('/shop/payment/success')
  await expect(page.getByRole('heading', { name: 'Payment complete', exact: true })).toBeVisible()
})
