import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // `@/shared/ui` instead of `../../../shared/ui`. Keep in sync with jsconfig.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    proxy: {
      '/api/game': 'http://127.0.0.1:8082',
      '/api/admin/match-settings': 'http://127.0.0.1:8082',
      '/dev/tables': 'http://127.0.0.1:8082',
      '/ws/game': { target: 'ws://127.0.0.1:8082', ws: true },
      '/api/ranking': 'http://127.0.0.1:8086',
      '/api/seasons': 'http://127.0.0.1:8086',
      '/api/rooms': 'http://127.0.0.1:8087',
      '/api/tournaments': 'http://127.0.0.1:8087',
    },
  },
})
