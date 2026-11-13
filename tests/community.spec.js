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
    if (path === '/api/auth/session/claim' || path === '/api/auth/session') return route.fulfill({ json: { result: {} } })
    if (path === '/api/game/me/active-table') return route.fulfill({ json: null })
    if (path === '/api/auth/csrf') return route.fulfill({ json: { result: { token: 'csrf-test' } } })
    if (path === '/api/auth/me') return route.fulfill({ json: { result: { accountId: self, email: 'player@example.test', role: 'USER', profile: { displayName: 'Minh Poker' } } } })
    if (path === '/api/profiles/batch') return route.fulfill({ json: { result: [{ accountId: friend, displayName: 'Linh Ace' }] } })
    if (path === '/api/party/me') return route.fulfill({ json: null })
    if (path.endsWith('/status')) return route.fulfill({ json: { status: 'NONE' } })
    if (path === '/api/friends') return route.fulfill({ json: pageOf([friend]) })
    if (path === '/api/friends/requests') return route.fulfill({ json: pageOf([{ id: requestId, requesterId: friend, addresseeId: self, status: 'PENDING' }]) })
    if (path === '/api/blocks') return route.fulfill({ json: pageOf([]) })
    if (path === '/api/chat/conversations/direct') return route.fulfill({ json: room })
    if (path === `/api/chat/conversations/${conversationId}`) return route.fulfill({ json: room })
    if (path === `/api/chat/conversations/${conversationId}/messages`) return route.fulfill({ json: { items: [], nextCursor: null } })
    return route.fulfill({ status: 503, json: { message: 'No test fixture for this endpoint.' } })
  })
})

test('chat restores a moderated message for editing without offering retry', async ({ page }) => {
  const sends = []
  await page.route('**/api/auth/session/claim', route => route.fulfill({ json: { result: {} } }))
  await page.route('**/api/auth/session', route => route.fulfill({ json: { result: {} } }))
  await page.route('**/api/game/me/active-table', route => route.fulfill({ json: null }))
  await page.route(`**/api/chat/conversations/${conversationId}/messages`, route => {
    const body = route.request().postDataJSON()
    sends.push(body)
    if (body.content === 'dcm') return route.fulfill({
      status: 400,
      json: { code: 'CHAT_CONTENT_NOT_ALLOWED', message: 'Tin nhắn có từ ngữ không phù hợp.' },
    })
    return route.fulfill({ status: 201, json: {
      ...body, id: 'message-test', conversationId, senderId: self,
      createdAt: '2026-10-22T10:00:00Z',
    } })
  })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends & party', exact: true }).click()
  await page.getByRole('button', { name: 'Message', exact: true }).click()
  const input = page.getByRole('textbox', { name: 'Message' })
  await expect(input).toBeEnabled()
  await input.fill('dcm')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(page.getByText('Your message contains inappropriate language. Please edit it before sending.')).toBeVisible()
  await expect(input).toHaveValue('dcm')
  await expect(page.getByRole('button', { name: /Retry/ })).toHaveCount(0)
  await input.fill('Xin chào')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(input).toHaveValue('')
  await expect(page.getByText('Xin chào', { exact: true })).toBeVisible()
  expect(sends.map(row => row.content)).toEqual(['dcm', 'Xin chào'])
})

test('lobby ports the lounge controls and party membership from the server', async ({ page }) => {
  let party = null
  await page.route('**/api/party/me', route => route.fulfill({ json: party }))
  await page.route('**/api/party/create', route => {
    expect(route.request().headers()['x-xsrf-token']).toBe('csrf-test')
    expect(route.request().headers()['x-user-id']).toBeUndefined()
    party = { partyId: 'party-test', partyCode: 'AB12CD34', password: '482913', leaderId: self, memberIds: [self] }
    return route.fulfill({ json: party })
  })
  await page.goto('/lobby')
  await expect(page.getByRole('heading', { name: 'Ranked', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Casual', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Create party', exact: true }).click()
  await expect(page.getByText('AB12CD34', { exact: true })).toBeVisible()
  await expect(page.getByText('482913', { exact: true })).toBeVisible()
  await expect(page.getByPlaceholder('Player UUID')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Ranked', exact: true })).toHaveAttribute('href', '/ranked')
  await expect(page.getByTestId('lobby-3d-scene')).toHaveAttribute('data-render-status', 'ready', { timeout: 20000 })
  await page.screenshot({ path: 'artifacts/community-lobby-desktop.png', fullPage: true })
})

test('party is joined with the shared code and password', async ({ page }) => {
  let party = null
  let joinBody = null
  await page.route('**/api/party/me', route => route.fulfill({ json: party }))
  await page.route('**/api/party/join', route => {
    joinBody = route.request().postDataJSON()
    party = { partyId: 'party-test', partyCode: 'AB12CD34', password: '482913', leaderId: friend, memberIds: [friend, self] }
    return route.fulfill({ json: party })
  })
  await page.goto('/lobby')
  const join = page.getByRole('button', { name: 'Join party', exact: true })
  await page.getByLabel('Join with party code').fill('ab12-cd34')
  await page.getByLabel('Password', { exact: true }).fill('48a29')
  await expect(join).toBeDisabled()
  await page.getByLabel('Password', { exact: true }).fill(' 482 913 ')
  await join.click()
  await expect(page.getByText('Joined the party.')).toBeVisible()
  expect(joinBody).toEqual({ partyCode: 'AB12CD34', password: '482913' })
  await expect(page.getByText('482913', { exact: true })).toBeVisible()
})

test('leaving the party asks in the app popup; Escape keeps the player in', async ({ page }) => {
  let party = { partyId: 'party-test', partyCode: 'AB12CD34', password: '482913', leaderId: friend, memberIds: [friend, self] }
  let left = false
  await page.route('**/api/party/me', route => route.fulfill({ json: party }))
  await page.route('**/api/party/leave', route => { left = true; party = null; return route.fulfill({ status: 204 }) })
  await page.goto('/lobby')
  const leave = page.getByRole('button', { name: 'Leave party', exact: true })
  const question = page.getByRole('alertdialog', { name: 'Leave party?' })
  await leave.click()
  await expect(question.getByRole('button', { name: 'Cancel' })).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(question).toHaveCount(0)
  await expect(leave).toBeFocused()
  expect(left).toBe(false)
  await leave.click()
  await question.getByRole('button', { name: 'Leave party', exact: true }).click()
  await expect(page.getByText('You left the party.')).toBeVisible()
  expect(left).toBe(true)
})

test('removing a friend asks first, and Escape closes only the popup, not the community panel', async ({ page }) => {
  let removed = false
  await page.route(`**/api/friends/${friend}`, route => { removed = true; return route.fulfill({ status: 204 }) })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends', exact: true }).click()
  const panel = page.getByRole('dialog', { name: 'Friends & connections' })
  const question = page.getByRole('alertdialog', { name: 'Remove friend?' })
  await panel.getByRole('button', { name: 'Remove friend' }).click()
  await expect(question).toContainText('Linh Ace will be removed from your friends')
  await page.keyboard.press('Escape')
  await expect(question).toHaveCount(0)
  await expect(panel).toBeVisible()
  expect(removed).toBe(false)
  await panel.getByRole('button', { name: 'Remove friend' }).click()
  await question.getByRole('button', { name: 'Remove friend' }).click()
  await expect(panel.getByText('Friend removed.')).toBeVisible()
  expect(removed).toBe(true)
})

// Casual play is room-based now, so only ranked starts a queue from the lobby.
for (const [mode, button, heading] of [['RANK', 'Find ranked match', 'Ranked']]) {
test('matchmaking stays on the 3D lobby and the floating card can be minimized and restored', async ({ page }) => {
  let queue = { status: 'NONE' }
  let joins = 0
  await page.route(`**/api/matchmaking/${mode.toLowerCase()}/status`, route => route.fulfill({ json: queue }))
  await page.route(`**/api/matchmaking/${mode.toLowerCase()}/join`, route => {
    joins++
    queue = { status: 'WAITING', mode, joinedAt: new Date().toISOString(), playerCount: 2, minPlayers: 4, maxPlayers: 6, position: 1 }
    return route.fulfill({ json: queue })
  })
  await page.route(`**/api/matchmaking/${mode.toLowerCase()}/leave`, route => { queue = { status: 'NONE' }; return route.fulfill({ status: 204 }) })
  await page.goto('/lobby')
  await page.getByRole('button', { name: button, exact: true }).click()
  await expect(page).toHaveURL(mode === 'NORMAL' ? /\/ranked\?mode=NORMAL$/ : /\/ranked$/)
  await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  await expect(page.getByTestId('matchmaking-card')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Searching for players' })).toBeVisible()
  await page.getByRole('link', { name: 'Lobby', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'You’re in the queue' })).toBeVisible()
  await expect(page.getByTestId('matchmaking-card')).toHaveCount(0)
  await page.getByRole('button', { name: 'Back to matchmaking', exact: true }).click()
  await expect(page).toHaveURL(mode === 'NORMAL' ? /\/ranked\?mode=NORMAL$/ : /\/ranked$/)
  await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()
  expect(joins).toBe(1)
  await page.getByRole('button', { name: 'Cancel search', exact: true }).click()
  await expect(page.getByTestId('matchmaking-card')).toHaveCount(0)
  await expect(page).toHaveURL(/\/lobby$/)
  await expect(page.getByRole('button', { name: button, exact: true })).toBeVisible()
})
}

test('radar loads actual queue profiles and removes players who leave', async ({ page }) => {
  const newcomer = '00000000-0000-0000-0000-000000000004'
  let ids = [friend, self]
  await page.route('**/api/matchmaking/normal/status', route => route.fulfill({ json: {
    status: 'WAITING', mode: 'NORMAL', playerCount: ids.length, minPlayers: 2, maxPlayers: 6, playerIds: ids,
  } }))
  await page.route('**/api/profiles/batch?*', route => route.fulfill({ json: { result: [
    { accountId: friend, displayName: 'Linh Ace', avatarUrl: '/stitch-assets/avatar.svg' },
    { accountId: newcomer, displayName: 'Bao Poker', avatarUrl: '/stitch-assets/avatar.svg' },
  ] } }))
  await page.goto('/ranked?mode=NORMAL')
  const roster = page.getByTestId('queue-player')
  await expect(roster.nth(0)).toContainText('Linh Ace')
  await expect(roster.nth(1)).toContainText('Minh Poker (You)')
  await expect(roster.nth(0).locator('img')).toHaveAttribute('src', '/stitch-assets/avatar.svg')
  ids = [friend, self, newcomer]
  await expect(roster.nth(2)).toContainText('Bao Poker')
  ids = [self, newcomer]
  await expect(page.getByText('Linh Ace', { exact: true })).toHaveCount(0)
  await expect(roster.nth(0)).toContainText('Minh Poker (You)')
  await expect(roster.nth(1)).toContainText('Bao Poker')
  await expect(roster.nth(2)).toContainText('Finding…')
})

test('audio toggle persists and prevents further UI effects while muted', async ({ page }) => {
  await page.addInitScript(() => {
    window.__audioStarts = 0
    const value = () => ({ setValueAtTime() {}, exponentialRampToValueAtTime() {} })
    const node = () => ({ connect() { return this }, start() { window.__audioStarts++ }, stop() {} })
    window.AudioContext = class {
      state = 'running'
      sampleRate = 44100
      currentTime = 0
      destination = {}
      resume() { return Promise.resolve() }
      close() { return Promise.resolve() }
      createBuffer(channels, length) { return { getChannelData: () => new Float32Array(length) } }
      createGain() { return { ...node(), gain: value() } }
      createOscillator() { return { ...node(), frequency: value() } }
      createBufferSource() { return node() }
      createBiquadFilter() { return { ...node(), frequency: value() } }
    }
  })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends', exact: true }).click()
  await page.getByRole('button', { name: 'Close panel' }).click()
  await expect.poll(() => page.evaluate(() => window.__audioStarts)).toBeGreaterThan(0)
  await page.getByRole('button', { name: 'Mute sound', exact: true }).click()
  const before = await page.evaluate(() => window.__audioStarts)
  await page.getByRole('button', { name: 'Friends', exact: true }).click()
  await page.getByRole('button', { name: 'Close panel' }).click()
  expect(await page.evaluate(() => window.__audioStarts)).toBe(before)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Unmute sound', exact: true })).toBeVisible()
})

test('friend to direct chat, failed send and retry reuse clientMessageId', async ({ page }) => {
  const sends = []
  await page.route(`**/api/chat/conversations/${conversationId}/messages?*`, async route => {
    if (route.request().method() !== 'POST') return route.fulfill({ json: { items: [], nextCursor: null } })
    return route.fallback()
  })
  await page.route(`**/api/chat/conversations/${conversationId}/messages`, async route => {
    if (route.request().method() !== 'POST') return route.fulfill({ json: { items: [], nextCursor: null } })
    const body = route.request().postDataJSON()
    sends.push(body)
    if (sends.length === 1) return route.fulfill({ status: 503, json: { message: 'Try sending again.' } })
    return route.fulfill({ status: 201, json: { ...body, id: 'message-test', conversationId, senderId: self, createdAt: new Date().toISOString() } })
  })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends', exact: true }).click()
  await expect(page.getByText('Linh Ace', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Message', exact: true }).click()
  const input = page.getByRole('textbox', { name: 'Message' })
  await expect(input).toBeEnabled()
  await input.fill('Hi there!')
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await page.getByRole('button', { name: /Retry/ }).click()
  await expect(page.getByText('Hi there!', { exact: true })).toHaveCount(1)
  expect(sends).toHaveLength(2)
  expect(sends[0].clientMessageId).toBe(sends[1].clientMessageId)
  await page.screenshot({ path: 'artifacts/community-chat-desktop.png', fullPage: true })
})

test('friend invitation acceptance calls the backend; mobile drawer fits and restores focus', async ({ page }) => {
  let accepted = false
  await page.route(`**/api/friends/requests/${requestId}/accept`, route => { accepted = true; return route.fulfill({ json: {} }) })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/lobby')
  const open = page.getByRole('button', { name: 'Friends', exact: true })
  await open.click()
  await page.getByRole('tab', { name: 'Received requests' }).click()
  await page.getByRole('button', { name: 'Accept', exact: true }).click()
  await expect(page.getByRole('status').filter({ hasText: 'Friend request accepted.' })).toBeVisible()
  expect(accepted).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'artifacts/community-friends-mobile.png', fullPage: true })
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(open).toBeFocused()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
  await page.screenshot({ path: 'artifacts/community-lobby-mobile.png', fullPage: true })
})

test('STOMP uses an in-memory auth token and deduplicates notification events', async ({ page }) => {
  await page.route('**/api/auth/ws-token', route => route.fulfill({ json: { result: { accessToken: 'socket-test', expiresAt: new Date(Date.now() + 60000).toISOString() } } }))
  let connected = false
  for (const socketPath of ['/ws/social', '/ws/chat']) {
    await page.routeWebSocket(`**${socketPath}`, ws => {
      ws.onMessage(frame => {
        const text = frame.toString()
        if (text.startsWith('CONNECT\n')) {
          expect(text).toContain('Authorization:Bearer socket-test')
          ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0')
        }
        if (socketPath === '/ws/social' && text.startsWith('SUBSCRIBE\n')) {
          connected = true
          const subscription = text.match(/\nid:([^\n]+)/)[1]
          const body = JSON.stringify({ eventId: 'event-test', type: 'FRIEND_REQUEST', title: 'You have a new request', body: 'Linh Ace wants to be friends.', occurredAt: new Date().toISOString() })
          const message = `MESSAGE\nsubscription:${subscription}\nmessage-id:event-test\ncontent-type:application/json\n\n${body}\0`
          ws.send(message)
          ws.send(message)
        }
      })
    })
  }
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Notifications', exact: true }).click()
  await expect(page.getByText('You have a new request', { exact: true })).toHaveCount(1)
  expect(connected).toBe(true)
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain('socket-test')
})

test('switching to a failed tab does not expose actions for the previous friend list', async ({ page }) => {
  await page.route('**/api/blocks?*', route => route.fulfill({ status: 503, json: { message: 'Blocks unavailable' } }))
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Message', exact: true })).toBeVisible()
  await page.getByRole('tab', { name: 'Blocked' }).click()
  await expect(page.getByText('Blocks unavailable')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Unblock' })).toHaveCount(0)
})

test('table resolves MATCH chat by matchId across pages and keeps a closed conversation read-only', async ({ page }) => {
  const tableId = '00000000-0000-0000-0000-000000000005'
  const matchId = '00000000-0000-0000-0000-000000000006'
  const matchConversationId = '00000000-0000-0000-0000-000000000007'
  const matchRoom = { ...room, id: matchConversationId, type: 'MATCH', refId: matchId, closedAt: '2026-10-22T10:00:00Z' }
  let historyRead = false
  await page.route('**/api/auth/ws-token', route => route.fulfill({ json: { result: { accessToken: 'socket-test', expiresAt: new Date(Date.now() + 60000).toISOString() } } }))
  for (const socketPath of ['/ws/game', '/ws/social', '/ws/chat']) {
    await page.routeWebSocket(`**${socketPath}`, ws => ws.onMessage(frame => { if (frame.toString().startsWith('CONNECT\n')) ws.send('CONNECTED\nversion:1.2\nheart-beat:0,0\n\n\0') }))
  }
  await page.route(`**/api/game/tables/${tableId}`, route => route.fulfill({ json: {
    tableId, matchId, accountId: self, seats: [], board: [], pot: 0, street: 'PREFLOP', mode: 'NORMAL', handNumber: 1,
    actorSeat: 0, dealerSeat: 0, smallBlindSeat: 0, bigBlindSeat: 1, legalActions: [], actionSequence: 1,
    callAmount: 0, minRaiseTo: 20, maxRaiseTo: 1000,
    serverTime: new Date().toISOString(), deadline: new Date(Date.now() + 30000).toISOString(),
  } }))
  await page.route('**/api/chat/conversations?*', route => {
    const pageNumber = new URL(route.request().url()).searchParams.get('page')
    return route.fulfill({ json: { ...pageOf(pageNumber === '0' ? [room] : [matchRoom]), totalPages: 2 } })
  })
  await page.route(`**/api/chat/conversations/${matchConversationId}`, route => route.fulfill({ json: matchRoom }))
  await page.route(`**/api/chat/conversations/${matchConversationId}/messages?*`, route => { historyRead = true; return route.fulfill({ json: { items: [], nextCursor: null } }) })
  await page.goto(`/table/${tableId}`)
  await expect(page.getByRole('heading', { name: 'Match chat' })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Message' })).toBeDisabled()
  expect(historyRead).toBe(true)
})

const stranger = '00000000-0000-0000-0000-000000000005'
const busyFriend = '00000000-0000-0000-0000-000000000006'
const isPath = path => url => url.pathname === path

test('party room friend popover rechecks friendship on every open and closes on outside click or Escape', async ({ page }) => {
  let friendIds = []
  const checks = []
  await page.route(isPath('/api/party/me'), route => route.fulfill({ json: { partyId: 'party', leaderId: self, memberIds: [self, friend], partyCode: 'AB12CD34', password: '482913' } }))
  await page.route(isPath('/api/friends/check'), route => {
    checks.push(new URL(route.request().url()).searchParams.get('ids'))
    return route.fulfill({ json: friendIds })
  })
  await page.goto('/ranked?mode=PARTY')
  const avatar = page.getByRole('button', { name: 'View Linh Ace', exact: true })
  await avatar.click()
  await expect(page.getByRole('button', { name: 'Add friend', exact: true })).toBeEnabled()
  await page.getByRole('heading', { name: 'Party room' }).click()
  await expect(page.getByRole('button', { name: 'Add friend', exact: true })).toHaveCount(0)
  // The friendship is accepted elsewhere; reopening must ask again instead of trusting the first answer.
  friendIds = [friend]
  await avatar.click()
  await expect(page.getByRole('button', { name: 'Friends', exact: true })).toBeDisabled()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('button', { name: 'Friends', exact: true })).toHaveCount(0)
  await avatar.click()
  await expect(page.getByRole('button', { name: 'Friends', exact: true })).toBeVisible()
  await avatar.click()
  await expect(page.getByRole('button', { name: 'Friends', exact: true })).toHaveCount(0)
  // Dev StrictMode mounts twice, so count only that every open asked about exactly this player.
  expect(checks.length).toBeGreaterThanOrEqual(3)
  expect(new Set(checks)).toEqual(new Set([friend]))
})

test('party invite sends the code by chat and friends in a match cannot be invited', async ({ page }) => {
  const sends = []
  await page.route(isPath('/api/party/me'), route => route.fulfill({ json: { partyId: 'party', leaderId: self, memberIds: [self], partyCode: 'AB12CD34', password: '482913' } }))
  await page.route(isPath('/api/friends'), route => route.fulfill({ json: pageOf([friend, busyFriend]) }))
  await page.route(isPath('/api/profiles/batch'), route => route.fulfill({ json: { result: [{ accountId: friend, displayName: 'Linh Ace' }, { accountId: busyFriend, displayName: 'Bao Busy' }] } }))
  await page.route(isPath('/api/game/players/in-match'), route => route.fulfill({ json: [busyFriend] }))
  await page.route(isPath(`/api/chat/conversations/${conversationId}/messages`), route => {
    sends.push(route.request().postDataJSON())
    return route.fulfill({ status: 201, json: { id: 'message-test', conversationId, senderId: self } })
  })
  await page.goto('/ranked?mode=PARTY')
  await page.getByText('Invite friends', { exact: true }).click()
  const busy = page.getByRole('listitem').filter({ hasText: 'Bao Busy' })
  await expect(busy.getByText('In a match', { exact: true })).toBeVisible()
  await expect(busy.getByRole('button', { name: 'In match', exact: true })).toBeDisabled()
  const free = page.getByRole('listitem').filter({ hasText: 'Linh Ace' })
  await free.getByRole('button', { name: 'Invite', exact: true }).click()
  await expect(free.getByRole('button', { name: 'Invited', exact: true })).toBeDisabled()
  expect(sends).toHaveLength(1)
  expect(sends[0].content).toContain('AB12CD34')
  expect(sends[0].content).toContain('482913')
})

test('leaderboard offers add friend only to non-friends and never on the friends tab', async ({ page }) => {
  const row = (accountId, position) => ({ position, rank: position, accountId, elo: 100 - position, tier: 'NEWBIE', winStreak: 0, matchesPlayed: 0 })
  await page.route(isPath('/api/seasons/current'), route => route.fulfill({ json: { id: 'season', name: 'Season 1', endAt: '2099-01-01T00:00:00Z' } }))
  await page.route(isPath('/api/ranking/leaderboard'), route => route.fulfill({ json: { content: [row(friend, 1), row(stranger, 2), row(self, 3)], totalElements: 3, totalPages: 1 } }))
  await page.route(isPath('/api/ranking/me'), route => route.fulfill({ json: { ...row(self, 3), peakElo: 97 } }))
  await page.route(isPath('/api/ranking/friends'), route => route.fulfill({ json: [{ ...row(friend, 1), you: false }, { ...row(self, 2), you: true }] }))
  await page.route(isPath('/api/friends/check'), route => route.fulfill({ json: [friend] }))
  await page.route(isPath('/api/friends/requests'), route => route.request().method() === 'POST'
    ? route.fulfill({ status: 201, json: { id: requestId, requesterId: self, addresseeId: stranger, status: 'PENDING' } })
    : route.fallback())
  await page.goto('/ranking')
  const table = page.getByRole('table')
  await expect(table.getByRole('button', { name: 'Add friend', exact: true })).toHaveCount(1)
  const strangerRow = table.getByRole('row').filter({ hasText: 'Player 000005' })
  await strangerRow.getByRole('button', { name: 'Add friend', exact: true }).click()
  await expect(strangerRow.getByRole('button', { name: 'Request sent', exact: true })).toBeDisabled()
  await page.goto('/ranking?view=friends')
  await expect(page.getByRole('table').getByRole('row')).toHaveCount(3)
  await expect(page.getByRole('table').getByRole('button')).toHaveCount(0)
})

test('a party invite in direct chat joins in one click and shows why when it cannot', async ({ page }) => {
  const joins = []
  let joined = false
  let accept = false
  const party = { partyId: 'party', partyCode: 'EE9B8864', password: '260619', leaderId: friend, memberIds: [friend, self] }
  const invite = (id, senderId) => ({ id, conversationId, senderId, messageType: 'TEXT', content: 'Join my party! Room code: EE9B8864 · Password: 260619', createdAt: '2026-11-13T16:51:00Z' })
  await page.route(isPath(`/api/chat/conversations/${conversationId}/messages`), route => route.fulfill({ json: { items: [invite('m1', friend), invite('m2', self)], nextCursor: null } }))
  await page.route(isPath('/api/party/me'), route => route.fulfill({ json: joined ? party : null }))
  await page.route(isPath('/api/party/join'), route => {
    joins.push(route.request().postDataJSON())
    if (!accept) return route.fulfill({ status: 403, json: { code: 'MM_PARTY_WRONG_PASSWORD', message: 'Mật khẩu party không đúng.' } })
    joined = true
    return route.fulfill({ json: party })
  })
  await page.goto('/lobby')
  await page.getByRole('button', { name: 'Friends & party', exact: true }).click()
  await page.getByRole('button', { name: 'Message', exact: true }).click()
  const join = page.getByRole('button', { name: 'Join party', exact: true })
  await expect(join).toHaveCount(1)
  await join.click()
  await expect(page.getByText('Mật khẩu party không đúng.', { exact: true })).toBeVisible()
  accept = true
  await join.click()
  await expect(page).toHaveURL(/\/ranked\?mode=PARTY$/)
  await expect(page.getByRole('heading', { name: 'Party room' })).toBeVisible()
  expect(joins).toEqual([{ partyCode: 'EE9B8864', password: '260619' }, { partyCode: 'EE9B8864', password: '260619' }])
})
