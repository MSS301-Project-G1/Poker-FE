import { test, expect } from '@playwright/test'

const self = '00000000-0000-0000-0000-000000000001'
const friend = '00000000-0000-0000-0000-000000000002'
const conversationId = '00000000-0000-0000-0000-000000000003'
const requestId = '00000000-0000-0000-0000-000000000004'
const room = { id: conversationId, type: 'DIRECT', memberIds: [self, friend], closedAt: null, createdAt: '2026-10-22T10:00:00Z' }
const pageOf = items => ({ items, page: 0, size: 20, totalPages: items.length ? 1 : 0, totalElements: items.length })

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('poker.lobby.checkInDismissed', 'true'))
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname
    if (!path.startsWith('/api/')) return route.fallback()
    if (path === '/api/auth/csrf') return route.fulfill({ json: { result: { token: 'csrf-test' } } })
    if (path === '/api/auth/me') return route.fulfill({ json: { result: { accountId: self, email: 'player@example.test', role: 'USER', profile: { displayName: 'Minh Poker' } } } })
    if (path === '/api/profiles/batch') return route.fulfill({ json: { result: [{ accountId: friend, displayName: 'Linh Ace' }] } })
    if (path === '/api/profiles/players/me') return route.fulfill({ json: { result: { accountId: self, playerCode: 'PK10000001', displayName: 'Minh Poker' } } })
    if (path === '/api/party/me') return route.fulfill({ json: null })
    if (path.endsWith('/status')) return route.fulfill({ json: { status: 'NONE' } })
    if (path === '/api/friends') return route.fulfill({ json: pageOf([friend]) })
    if (path === '/api/friends/requests') return route.fulfill({ json: pageOf([{ id: requestId, requesterId: friend, addresseeId: self, status: 'PENDING' }]) })
    if (path === '/api/blocks') return route.fulfill({ json: pageOf([]) })
    if (path === '/api/chat/conversations') return route.fulfill({ json: pageOf([room]) })
    if (path === '/api/chat/conversations/direct') return route.fulfill({ json: room })
    if (path === `/api/chat/conversations/${conversationId}`) return route.fulfill({ json: room })
    if (path === `/api/chat/conversations/${conversationId}/messages`) return route.fulfill({ json: { items: [], nextCursor: null } })
    return route.fulfill({ status: 503, json: { message: 'No test fixture for this endpoint.' } })
  })
})

test('finds players by name or public code and sends the selected identity without asking for a UUID', async ({ page }) => {
  const other = '00000000-0000-0000-0000-000000000005'
  const sent = []
  await page.route('**/api/profiles/search?*', route => {
    const query = new URL(route.request().url()).searchParams.get('q')
    const results = [
      { accountId: friend, displayName: 'Linh Ace', playerCode: 'PK10000002' },
      { accountId: other, displayName: 'Linh Ace', playerCode: 'PK10000003' },
    ]
    return route.fulfill({ json: { result: query === 'Linh' ? results : results.filter(player => player.playerCode === query) } })
  })
  await page.route('**/api/friends/requests', route => {
    if (route.request().method() !== 'POST') return route.fallback()
    sent.push(route.request().postDataJSON())
    expect(route.request().headers()['x-user-id']).toBeUndefined()
    expect(route.request().headers()['x-social-gateway-key']).toBeUndefined()
    return route.fulfill({ status: 201, json: {} })
  })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends & party', exact: true }).click()
  await expect(page.getByText('PK10000001', { exact: true })).toBeVisible()
  await expect(page.getByPlaceholder('Enter account ID (UUID)')).toHaveCount(0)
  const input = page.getByLabel('Find a player')
  await input.fill('Linh')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  const result = page.getByRole('listitem').filter({ hasText: 'PK10000003' })
  await expect(result.getByText('Linh Ace', { exact: true })).toBeVisible()
  await result.getByRole('button', { name: 'Add friend', exact: true }).click()
  await expect(result.getByRole('button', { name: 'Request sent', exact: true })).toBeDisabled()
  expect(sent).toEqual([{ addresseeId: other }])
  await input.fill('PK10000002')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page.getByRole('listitem').filter({ hasText: 'PK10000002' })).toBeVisible()
  await expect(page.getByRole('listitem').filter({ hasText: 'PK10000003' })).toHaveCount(0)
  await page.screenshot({ path: 'artifacts/community-player-search.png', fullPage: true })
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    const copy = await page.getByRole('button', { name: 'Copy code', exact: true }).boundingBox()
    const find = await page.getByRole('button', { name: 'Search', exact: true }).boundingBox()
    const field = await input.boundingBox()
    expect(copy.height).toBe(find.height)
    expect(copy.x + copy.width).toBeLessThanOrEqual(width)
    expect(Math.abs(field.height - find.height)).toBeLessThan(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: `artifacts/community-player-search-${width}.png`, fullPage: true })
  }
  await input.fill('Missing player')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await expect(page.getByText('No players found for “Missing player”.')).toBeVisible()
})

test('compact friends panel groups secondary lists and keeps invitation actions consistent', async ({ page }) => {
  let accepted = false
  await page.route('**/api/friends/requests?*', route => {
    const outgoing = new URL(route.request().url()).searchParams.get('direction') === 'OUTGOING'
    return route.fulfill({ json: pageOf([{ id: requestId, requesterId: outgoing ? self : friend, addresseeId: outgoing ? friend : self, status: accepted ? 'ACCEPTED' : 'PENDING' }]) })
  })
  await page.route(`**/api/friends/requests/${requestId}/accept`, route => {
    accepted = true
    return route.fulfill({ json: {} })
  })
  await page.route('**/api/blocks?*', route => route.fulfill({ json: pageOf([friend]) }))
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends & party', exact: true }).click()
  const panel = page.getByRole('dialog')
  await expect(panel.getByRole('tab')).toHaveCount(2)
  await expect(panel.getByRole('button', { name: 'Block', exact: true })).not.toBeVisible()
  await panel.getByLabel('Options for Linh Ace', { exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Block', exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toBeVisible()
  await expect(panel.getByRole('button', { name: 'Block', exact: true })).not.toBeVisible()
  await expect(panel.getByRole('tab', { name: 'Requests', exact: true })).toHaveCount(0)
  await expect(panel.getByText('Wants to be your friend', { exact: true })).toBeVisible()
  await expect(panel.getByText('PENDING', { exact: true })).toHaveCount(0)
  await expect(panel.getByLabel('Find a player')).toBeVisible()
  const accept = panel.getByRole('button', { name: 'Accept', exact: true })
  const decline = panel.getByRole('button', { name: 'Decline', exact: true })
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    const a = await accept.boundingBox()
    const d = await decline.boundingBox()
    expect(a.height).toBe(36)
    expect(d.height).toBe(a.height)
    expect(Math.abs(a.width - d.width)).toBeLessThan(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: `artifacts/community-invitations-${width}.png`, fullPage: true })
  }
  await accept.click()
  await expect(panel.getByText('Wants to be your friend', { exact: true })).toHaveCount(0)
  expect(accepted).toBe(true)
  await panel.getByLabel('Friend options', { exact: true }).click()
  await panel.getByRole('button', { name: 'Sent requests', exact: true }).click()
  await expect(panel.getByRole('heading', { name: 'Sent requests', exact: true })).toBeVisible()
  await panel.getByLabel('Friend options', { exact: true }).click()
  await panel.getByRole('button', { name: 'Blocked', exact: true }).click()
  await expect(panel.getByRole('button', { name: 'Unblock', exact: true })).toBeVisible()
  await panel.getByRole('button', { name: 'Back to friends', exact: true }).click()
  await expect(panel.getByRole('tab', { name: 'Friends', exact: true })).toHaveAttribute('aria-selected', 'true')
})

test('one launcher opens friends and messages in the same panel', async ({ page }) => {
  await page.goto('/lobby')
  const launcher = page.getByRole('button', { name: 'Friends & party', exact: true })
  await expect(launcher).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Messages', exact: true })).toHaveCount(0)
  await launcher.click()
  const panel = page.getByRole('dialog')
  await expect(panel).toHaveAccessibleName('Friends & messages')
  await panel.getByRole('button', { name: 'Message', exact: true }).click()
  await expect(panel.getByRole('tab', { name: 'Chat', exact: true })).toHaveAttribute('aria-selected', 'true')
  await expect(panel.getByRole('textbox', { name: 'Message' })).toBeEnabled()
  await panel.getByRole('tab', { name: 'Friends', exact: true }).click()
  await expect(panel.getByText('PK10000001', { exact: true })).toBeVisible()
  await panel.getByRole('tab', { name: 'Chat', exact: true }).click()
  await panel.getByRole('button', { name: '← All conversations', exact: true }).click()
  await expect(panel.getByText('Direct message', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(panel).toHaveCount(0)
  await expect(launcher).toBeFocused()
})

test('community launcher stays fixed at bottom right across pages and scrolling', async ({ page }) => {
  for (const path of ['/lobby', '/ranked', '/shop']) {
    await page.goto(path)
    const launcher = page.getByRole('button', { name: 'Friends & party', exact: true })
    await expect(launcher).toHaveCount(1)
    await expect(launcher).toBeVisible()
    const dock = page.getByRole('navigation', { name: 'Quick connect', exact: true })
    await expect(dock).toHaveCSS('position', 'fixed')
    const before = await launcher.boundingBox()
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    const after = await launcher.boundingBox()
    expect(Math.abs(after.y - before.y)).toBeLessThan(1)
    const viewport = page.viewportSize()
    expect(viewport.width - (after.x + after.width)).toBeLessThan(36)
    expect(viewport.height - (after.y + after.height)).toBeLessThan(100)
  }
  await page.setViewportSize({ width: 390, height: 844 })
  const launcher = page.getByRole('button', { name: 'Friends & party', exact: true })
  await expect(launcher.getByText('Friends & party', { exact: true })).toBeVisible()
  await launcher.click()
  await expect(page.getByRole('dialog').getByRole('tab', { name: 'Friends', exact: true })).toBeVisible()
})

test('party room: create opens the preparation page with credentials before queuing the group', async ({ page }) => {
  let party = null
  let queue = { status: 'NONE' }
  let joins = 0
  await page.route('**/api/party/me', route => route.fulfill({ json: party }))
  await page.route('**/api/party/create', route => {
    party = { partyId: 'party-room', partyCode: 'AB12CD34', password: '482913', leaderId: self, memberIds: [self] }
    return route.fulfill({ status: 201, json: party })
  })
  await page.route('**/api/matchmaking/normal/status', route => route.fulfill({ json: queue }))
  await page.route('**/api/matchmaking/normal/join', route => {
    joins++
    queue = { status: 'WAITING', mode: 'NORMAL', playerIds: party.memberIds, playerCount: party.memberIds.length, maxPlayers: 6, minPlayers: 4, joinedAt: new Date().toISOString() }
    return route.fulfill({ status: 204 })
  })
  await page.route('**/api/matchmaking/normal/leave', route => {
    queue = { status: 'NONE' }
    return route.fulfill({ status: 204 })
  })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Create party', exact: true }).click()
  await expect(page).toHaveURL(/\/ranked\?mode=PARTY$/)
  await expect(page.getByRole('heading', { name: 'Party room', exact: true })).toBeVisible()
  await expect(page.getByText('Casual with your party · 6 players · No-Limit Hold’em', { exact: true })).toBeVisible()
  await expect(page.getByText('AB12CD34', { exact: true })).toBeVisible()
  await expect(page.getByText('482913', { exact: true })).toBeVisible()
  await expect(page.locator(`[data-testid="queue-player"][data-account-id="${self}"]`)).toBeVisible()
  expect(joins).toBe(0)
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    await page.screenshot({ path: `artifacts/party-preparation-${width}.png`, fullPage: true })
  }
  party = { ...party, memberIds: [self, friend] }
  await expect(page.locator(`[data-testid="queue-player"][data-account-id="${friend}"]`)).toBeVisible()
  await page.getByRole('button', { name: 'Find match with party', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Cancel search', exact: true })).toBeVisible()
  expect(joins).toBe(1)
  await expect(page.getByText('AB12CD34', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel search', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Find match with party', exact: true })).toBeVisible()
  await expect(page).toHaveURL(/\/ranked/)
  await expect(page.getByText('482913', { exact: true })).toBeVisible()
  await page.goto('/lobby')
  await expect(page.getByRole('button', { name: 'Join party room', exact: true })).toBeVisible()
  await expect(page.getByText('AB12CD34', { exact: true })).toHaveCount(0)
})

test('party room: joining opens the room and a member waits for the leader to search', async ({ page }) => {
  let party = null
  await page.route('**/api/party/me', route => route.fulfill({ json: party }))
  await page.route('**/api/party/join', route => {
    expect(route.request().postDataJSON()).toEqual({ partyCode: 'AB12CD34', password: '482913' })
    party = { partyId: 'party-room', partyCode: 'AB12CD34', password: '482913', leaderId: friend, memberIds: [friend, self] }
    return route.fulfill({ json: party })
  })
  await page.goto('/lobby')
  await page.getByLabel('Join with party code').fill('AB12CD34')
  await page.getByLabel('Password', { exact: true }).fill('482913')
  await page.getByRole('button', { name: 'Join party', exact: true }).click()
  await expect(page).toHaveURL(/\/ranked\?mode=PARTY$/)
  await expect(page.getByText('482913', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Find match with party', exact: true })).toBeDisabled()
  await expect(page.getByText('Waiting for the leader to start the search', { exact: true })).toBeVisible()
})

test('party room: solo pages identify Normal and Rank separately', async ({ page }) => {
  await page.goto('/ranked?mode=NORMAL')
  await expect(page.getByRole('heading', { name: 'Casual', exact: true })).toBeVisible()
  await expect(page.getByText('Solo · 6 players · No-Limit Hold’em', { exact: true })).toBeVisible()
  await expect(page.getByText('Party code', { exact: true })).toHaveCount(0)
  await page.goto('/ranked')
  await expect(page.getByRole('heading', { name: 'Ranked', exact: true })).toBeVisible()
  await expect(page.getByText('Solo · 6 players · No-Limit Hold’em', { exact: true })).toBeVisible()
})

test('chat notifications: deduplicates messages, ignores self and table chat, and clears unread when opened', async ({ page }) => {
  let pushChat
  await page.route('**/api/auth/ws-token', route => route.fulfill({ json: { result: { accessToken: 'socket-test', expiresAt: new Date(Date.now() + 60000).toISOString() } } }))
  for (const socketPath of ['/ws/social', '/ws/chat']) {
    await page.routeWebSocket(`**${socketPath}`, ws => {
      ws.onMessage(frame => {
        const text = frame.toString()
        if (text.startsWith('CONNECT\n')) ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0')
        if (socketPath === '/ws/chat' && text.startsWith('SUBSCRIBE\n')) {
          const subscription = text.match(/\nid:([^\n]+)/)[1]
          pushChat = message => ws.send(`MESSAGE\nsubscription:${subscription}\nmessage-id:${message.id}\ncontent-type:application/json\n\n${JSON.stringify(message)}\0`)
        }
      })
    })
  }
  const matchConversation = '00000000-0000-0000-0000-000000000099'
  await page.route(`**/api/chat/conversations/${matchConversation}`, route => route.fulfill({ json: { ...room, id: matchConversation, type: 'MATCH' } }))
  await page.route('**/api/chat/conversations?*', route => {
    expect(new URL(route.request().url()).searchParams.get('type')).toBe('DIRECT')
    return route.fulfill({ json: pageOf([room]) })
  })
  await page.goto('/lobby')
  await expect.poll(() => Boolean(pushChat)).toBe(true)
  const message = { id: 'message-1', conversationId, senderId: friend, content: 'Play together?', messageType: 'TEXT', createdAt: new Date().toISOString() }
  pushChat(message)
  pushChat(message)
  pushChat({ ...message, id: 'own-message', senderId: self })
  pushChat({ ...message, id: 'table-message', conversationId: matchConversation })
  const dock = page.getByRole('navigation', { name: 'Quick connect' })
  await expect(dock.getByLabel('1 unread message', { exact: true })).toBeVisible()
  const alert = page.getByRole('complementary', { name: 'New message', exact: true })
  await expect(alert.getByText('Linh Ace', { exact: true })).toBeVisible()
  await expect(alert.getByText('Play together?', { exact: true })).toBeVisible()
  await alert.getByRole('button', { name: 'Dismiss message alert' }).click()
  await expect(alert).toHaveCount(0)
  await expect(dock.getByLabel('1 unread message', { exact: true })).toBeVisible()
  await dock.getByRole('button', { name: 'Friends & party', exact: true }).click()
  const dialog = page.getByRole('dialog')
  const direct = dialog.getByRole('listitem').filter({ hasText: 'Linh Ace' })
  await expect(direct.getByLabel('1 unread message', { exact: true })).toBeVisible()
  await direct.getByRole('button').click()
  await expect(dialog.getByRole('textbox', { name: 'Message' })).toBeEnabled()
  await expect(dock.getByLabel('1 unread message', { exact: true })).toHaveCount(0)
  pushChat({ ...message, id: 'message-2', content: 'Read live' })
  await expect(dialog.getByText('Read live', { exact: true })).toBeVisible()
  await expect(alert).toHaveCount(0)
  await expect(dock.getByLabel('1 unread message', { exact: true })).toHaveCount(0)
  await page.keyboard.press('Escape')
  pushChat({ ...message, id: 'message-3', content: 'Next message' })
  await expect(alert).toBeVisible()
  await alert.getByRole('button', { name: 'Open new message', exact: true }).click()
  await expect(dialog.getByRole('textbox', { name: 'Message' })).toBeEnabled()
  await expect(dock.getByLabel('1 unread message', { exact: true })).toHaveCount(0)
})

test('chat list: hides closed poker tables and requests only direct conversations', async ({ page }) => {
  await page.route('**/api/chat/conversations?*', route => {
    expect(new URL(route.request().url()).searchParams.get('type')).toBe('DIRECT')
    return route.fulfill({ json: pageOf([room, { ...room, id: 'old-match', type: 'MATCH', refId: 'old-table', closedAt: new Date().toISOString() }]) })
  })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends & party', exact: true }).click()
  await page.getByRole('tab', { name: 'Chat', exact: true }).click()
  await expect(page.getByText('Direct message', { exact: true })).toBeVisible()
  await expect(page.getByText(/Poker table ·/)).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Chat pages', exact: true })).toHaveCount(0)
})

test('party disband: leader confirms that everyone leaves and returns to lobby', async ({ page }) => {
  let party = { partyId: 'party-disband', partyCode: 'AB12CD34', password: '482913', leaderId: self, memberIds: [self, friend] }
  let left = false
  await page.route('**/api/party/me', route => route.fulfill({ json: party }))
  await page.route('**/api/party/leave', route => {
    left = true
    party = null
    return route.fulfill({ status: 204 })
  })
  await page.goto('/ranked?mode=PARTY')
  await page.getByRole('button', { name: 'Leave party', exact: true }).click()
  const confirm = page.getByRole('alertdialog', { name: 'Disband party?', exact: true })
  await expect(confirm).toContainText('removes every member')
  expect(left).toBe(false)
  await confirm.getByRole('button', { name: 'Leave and disband', exact: true }).click()
  await expect(page).toHaveURL(/\/lobby$/)
  expect(left).toBe(true)
  await expect(page.getByRole('button', { name: 'Create party', exact: true })).toBeVisible()
  await expect(page.getByText('AB12CD34', { exact: true })).toHaveCount(0)
})

test('party disband: member leaves the room automatically when leader disbands', async ({ page }) => {
  let party = { partyId: 'party-disband', partyCode: 'AB12CD34', password: '482913', leaderId: friend, memberIds: [friend, self] }
  await page.route('**/api/party/me', route => route.fulfill({ json: party }))
  await page.goto('/ranked?mode=PARTY')
  await expect(page.getByText('AB12CD34', { exact: true })).toBeVisible()
  party = null
  await expect(page).toHaveURL(/\/lobby$/)
  await expect(page.getByRole('button', { name: 'Create party', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Find match with party', exact: true })).toHaveCount(0)
})

