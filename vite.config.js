import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev-proxy target. Docker sets GAME_SERVICE_URL (see compose.yml); local `npm run dev` keeps the default.
const gameService = process.env.GAME_SERVICE_URL || 'http://127.0.0.1:8082'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/shared/ui` instead of `../../../shared/ui`. Keep in sync with jsconfig.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // Docker bind mounts on Windows/macOS do not forward file events, so the container polls.
    watch: process.env.WATCH_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
    proxy: {
      '/api/game': gameService,
      '/api/admin/match-settings': gameService,
      '/dev/tables': gameService,
      '/ws/game': { target: gameService.replace(/^http/, 'ws'), ws: true },
    },
  },
})
