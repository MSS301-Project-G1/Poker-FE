import { env } from '@/shared/config/env'

const storageKey = 'poker.game.devUser'

// Local-development identity: ?devUser=<uuid> in the URL, or the last one saved in this tab.
export function devIdentity() {
  if (!env.gameDevMode) return null
  return new URLSearchParams(window.location.search).get('devUser') || sessionStorage.getItem(storageKey)
}

export function rememberDevIdentity(accountId) {
  sessionStorage.setItem(storageKey, accountId)
}
