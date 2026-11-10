// One account, one session, one active tab (BE auth-service/SESSION-PROTECTION.md).
// The ID lives only in this document's memory: "Duplicate tab" copies sessionStorage, and F5 must start a new tab.
export const tabId = crypto.randomUUID()

export const sessionErrors = { replaced: 'AUTH_SESSION_REPLACED', tabReplaced: 'AUTH_TAB_REPLACED', banned: 'AUTH_ACCOUNT_BANNED' }
const lostCodes = new Set(Object.values(sessionErrors))

const lockName = 'poker.auth.session'
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(lockName)
const lostListeners = new Set()

export const isSessionLost = error => lostCodes.has(error?.code)

/** Login, claim, refresh and logout rotate the refresh cookie every tab shares, so they run one at a time. */
export function withSessionLock(task) {
  return navigator.locks ? navigator.locks.request(lockName, task) : task()
}

/** Asks the other tabs to re-check ownership now. Carries no token, cookie or tab ID: the BE decides. */
export function announceSessionChange() {
  channel?.postMessage('changed')
}

export function onSessionChange(listener) {
  channel?.addEventListener('message', listener)
  return () => channel?.removeEventListener('message', listener)
}

/** Called with { code, message } when the BE says this tab or session no longer owns the account. */
export function reportSessionLost(error) {
  if (isSessionLost(error)) lostListeners.forEach(listener => listener(error))
}

export function onSessionLost(listener) {
  lostListeners.add(listener)
  return () => lostListeners.delete(listener)
}
