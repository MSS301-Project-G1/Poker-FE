// The only file that reads import.meta.env. Add new VITE_* variables here with a comment.
export const env = {
  // Game service base URL. Empty means same origin (the Vite dev proxy or the API gateway).
  gameApiBaseUrl: import.meta.env.VITE_GAME_API_BASE_URL || '',
  // STOMP endpoint of the game service; relative URLs resolve against the current page.
  gameSocketUrl: import.meta.env.VITE_GAME_WS_URL || '/ws/game',
  // Local bot tables and ?devUser identities. Never enabled in production builds.
  gameDevMode: import.meta.env.DEV && import.meta.env.VITE_GAME_DEV_MODE === 'true',
}
