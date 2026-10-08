import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/game': 'http://127.0.0.1:8082',
      '/api/admin/match-settings': 'http://127.0.0.1:8082',
      '/dev/tables': 'http://127.0.0.1:8082',
      '/ws/game': { target: 'ws://127.0.0.1:8082', ws: true },
    },
  },
})
