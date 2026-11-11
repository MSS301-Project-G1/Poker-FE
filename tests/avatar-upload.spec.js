import { expect, test } from '@playwright/test'
import { Buffer } from 'node:buffer'

const origin = 'http://localhost:5195'
const accountId = '00000000-0000-4000-8000-000000000001'

async function fixture(page, role = 'USER') {
  const state = { presigns: [], puts: [], confirms: [], order: [] }
  const profile = { accountId, email: 'avatar@example.test', displayName: 'Avatar player', avatarUrl: null }
  const key = `poker/avatars/${role === 'ADMIN' ? 'preset-staging' : 'staging'}/${accountId}/fixture.jpg`
  const headers = { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type,X-Tab-Id,X-XSRF-TOKEN' }
  await page.context().addCookies([{ name: 'accessToken', value: 'avatar-fixture-cookie', url: origin, httpOnly: true, sameSite: 'Lax' }])
  await page.route('**/avatar-upload', async route => {
    state.order.push('put')
    state.puts.push({ headers: route.request().headers(), body: route.request().postDataBuffer(), method: route.request().method() })
    await route.fulfill({ status: 200, body: '' })
  })
  await page.route('**/api/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    if (!path.startsWith('/api/')) return route.fallback()
    const reply = (json, status = 200) => route.fulfill({ status, headers, json })
    if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers })
    if (path === '/api/auth/csrf') return reply({ result: { token: 'avatar-fixture-csrf' } })
    if (path === '/api/auth/session/claim' || path === '/api/auth/session') return reply({ result: { accountId } })
    if (path === '/api/auth/me') return reply({ result: { accountId, role, email: profile.email, profile } })
    if (path === '/api/game/me/active-table' || path === '/api/party/me') return reply(null)
    if (path === '/api/auth/ws-token') return reply({ message: 'Realtime is outside this avatar test.' }, 503)
    if (path === '/api/profiles/me') return reply({ result: profile })
    if (path === '/api/profiles/avatars' || (path === '/api/admin/avatars' && request.method() === 'GET')) return reply({ result: [] })
    if (path.endsWith('/avatar/presign') || path === '/api/admin/avatars/presign') {
      state.order.push('presign')
      state.presigns.push({ params: Object.fromEntries(url.searchParams), method: request.method() })
      return reply({ result: { key, uploadUrl: `${origin}/avatar-upload`, method: 'PUT', headers: { 'Content-Type': url.searchParams.get('contentType') } } })
    }
    if (path === '/api/profiles/me/avatar' || (path === '/api/admin/avatars' && request.method() === 'POST')) {
      state.order.push('confirm')
      state.confirms.push({ body: request.postDataJSON(), headers: request.headers() })
      return reply({ result: role === 'ADMIN' ? { avatarId: 'fixture-avatar', name: request.postDataJSON().name, avatarUrl: '/stitch-assets/avatar.svg', active: true }
        : { ...profile, avatarUrl: '/stitch-assets/avatar.svg' } })
    }
    if (path === '/api/wallet/me') return reply({ data: { coinBalance: 0, vipCoinBalance: 0 } })
    if (path.endsWith('/status')) return reply({ status: 'NONE' })
    return reply({ items: [], content: [], page: 0, totalElements: 0 })
  })
  await page.goto(role === 'ADMIN' ? '/admin/avatars' : '/account')
  await expect(page.getByRole('heading', { name: role === 'ADMIN' ? 'Avatar presets' : 'Avatar', exact: true })).toBeVisible()
  return state
}

async function raster(page, type, width = 32, height = 24) {
  return Buffer.from(await page.evaluate(({ type, width, height }) => {
    const canvas = document.createElement('canvas')
    canvas.width = width; canvas.height = height
    const context = canvas.getContext('2d')
    context.fillStyle = '#aa7722'; context.fillRect(0, 0, width, height)
    return canvas.toDataURL(type).split(',')[1]
  }, { type, width, height }), 'base64')
}

function untouched(state) {
  expect(state.presigns).toHaveLength(0)
  expect(state.puts).toHaveLength(0)
  expect(state.confirms).toHaveLength(0)
}

test('oversized dimensions are explained before requesting a user upload URL', async ({ page }) => {
  const state = await fixture(page)
  const buffer = await raster(page, 'image/jpeg', 2049, 16)
  await page.locator('input[type=file]').setInputFiles({ name: 'too-wide.jpg', mimeType: 'image/jpeg', buffer })
  await expect(page.getByRole('alert')).toContainText('2049 × 16 px')
  await expect(page.getByRole('alert')).toContainText('at most 2048 px')
  untouched(state)
})

test('JPG and its legacy MIME alias keep their bytes and use canonical JPEG through presign PUT confirm', async ({ page }) => {
  const state = await fixture(page)
  const buffer = await raster(page, 'image/jpeg')
  for (const [index, mimeType] of ['image/jpeg', 'image/jpg'].entries()) {
    await page.locator('input[type=file]').setInputFiles({ name: 'avatar.JPG', mimeType, buffer })
    await expect.poll(() => state.confirms.length).toBe(index + 1)
    await expect(page.locator('input[type=file]')).toBeEnabled()
    expect(state.presigns[index].params.contentType).toBe('image/jpeg')
    expect(state.presigns[index].params.fileSize).toBe(String(buffer.length))
    expect(state.presigns[index].method).toBe('GET')
    expect(state.puts[index].method).toBe('PUT')
    expect(state.puts[index].headers['content-type']).toBe('image/jpeg')
    expect(state.puts[index].headers.cookie).toBeUndefined()
    expect(state.puts[index].body.equals(buffer)).toBe(true)
    expect(state.confirms[index].body).toEqual({ key: `poker/avatars/staging/${accountId}/fixture.jpg` })
  }
  expect(state.order).toEqual(['presign', 'put', 'confirm', 'presign', 'put', 'confirm'])
})

test('PNG at exactly 2048 pixels per side is accepted without resampling', async ({ page }) => {
  const state = await fixture(page)
  const buffer = await raster(page, 'image/png', 2048, 2048)
  await page.locator('input[type=file]').setInputFiles({ name: 'boundary.png', mimeType: 'image/png', buffer })
  await expect.poll(() => state.confirms.length).toBe(1)
  expect(state.presigns[0].params.contentType).toBe('image/png')
  expect(state.puts[0].body.equals(buffer)).toBe(true)
})

test('empty oversized unsupported and corrupt files never begin the upload flow', async ({ page }) => {
  const state = await fixture(page)
  const files = [
    { name: 'empty.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(0), error: 'empty' },
    { name: 'huge.png', mimeType: 'image/png', buffer: Buffer.alloc(2 * 1024 * 1024 + 1), error: 'no larger than 2 MB' },
    { name: 'vector.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg/>'), error: 'PNG or JPG/JPEG' },
    { name: 'fake.png', mimeType: 'image/png', buffer: Buffer.from('<svg/>'), error: 'not a valid PNG or JPG' },
    { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), error: 'cannot be read' },
  ]
  for (const { error, ...file } of files) {
    await page.locator('input[type=file]').setInputFiles(file)
    await expect(page.getByRole('alert')).toContainText(error)
    await expect(page.locator('input[type=file]')).toBeEnabled()
  }
  untouched(state)
})

test('missing MIME is determined from the actual file content', async ({ page }) => {
  const state = await fixture(page)
  const buffer = await raster(page, 'image/png')
  await page.locator('input[type=file]').evaluate((input, bytes) => {
    const transfer = new DataTransfer()
    transfer.items.add(new File([new Uint8Array(bytes)], 'avatar.png'))
    input.files = transfer.files
    input.dispatchEvent(new Event('change', { bubbles: true }))
  }, Array.from(buffer))
  await expect.poll(() => state.confirms.length).toBe(1)
  expect(state.presigns[0].params.contentType).toBe('image/png')
  expect(state.puts[0].body.equals(buffer)).toBe(true)
})

test('a mismatch between declared format and file bytes is rejected locally', async ({ page }) => {
  const state = await fixture(page)
  const buffer = await raster(page, 'image/png')
  await page.locator('input[type=file]').setInputFiles({ name: 'wrong.jpg', mimeType: 'image/jpeg', buffer })
  await expect(page.getByRole('alert')).toContainText('contents do not match its file type')
  untouched(state)
})

test('admin presets use the same dimension validation before any S3 request', async ({ page }) => {
  const state = await fixture(page, 'ADMIN')
  await page.getByLabel('Preset name').fill('Too tall')
  await page.getByLabel('Image', { exact: true }).setInputFiles({ name: 'tall.jpg', mimeType: 'image/jpeg', buffer: await raster(page, 'image/jpeg', 16, 2049) })
  await page.getByRole('button', { name: 'Create preset', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('16 × 2049 px')
  untouched(state)
})

test('a valid admin JPEG follows the existing S3 flow with the validated file and preset name', async ({ page }) => {
  const state = await fixture(page, 'ADMIN')
  const buffer = await raster(page, 'image/jpeg')
  await page.getByLabel('Preset name').fill('JPEG preset')
  await page.getByLabel('Image', { exact: true }).setInputFiles({ name: 'preset.jpeg', mimeType: 'image/jpeg', buffer })
  await page.getByRole('button', { name: 'Create preset', exact: true }).click()
  await expect.poll(() => state.confirms.length).toBe(1)
  expect(state.order).toEqual(['presign', 'put', 'confirm'])
  expect(state.puts[0].body.equals(buffer)).toBe(true)
  expect(state.puts[0].headers.cookie).toBeUndefined()
  expect(state.confirms[0].body).toEqual({ name: 'JPEG preset', key: `poker/avatars/preset-staging/${accountId}/fixture.jpg` })
})
