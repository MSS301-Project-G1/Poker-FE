// The only file that reads import.meta.env. Add new VITE_* variables here with a comment.
export const env = {
  // API gateway base URL. Dev defaults to the local gateway; production uses the nginx origin.
  apiBaseUrl: (import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://localhost:8080' : '')).replace(/\/+$/, ''),
  // Game service base URL. Empty means same origin (the Vite dev proxy or the API gateway).
  gameApiBaseUrl: import.meta.env.VITE_GAME_API_BASE_URL || '',
  // STOMP endpoint of the game service; relative URLs resolve against the current page.
  gameSocketUrl: import.meta.env.VITE_GAME_WS_URL || '/ws/game',
  socialSocketUrl: import.meta.env.VITE_SOCIAL_WS_URL || '/ws/social',
  chatSocketUrl: import.meta.env.VITE_CHAT_WS_URL || '/ws/chat',
  // Local bot tables and ?devUser identities. Never enabled in production builds.
  gameDevMode: import.meta.env.DEV && import.meta.env.VITE_GAME_DEV_MODE === 'true',
  isDev: Boolean(import.meta.env.DEV),
}
