import process from 'node:process'
import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function proxyLoggerPlugin() {
  return {
    name: 'proxy-logger',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        setTimeout(() => {
          console.log('\n  📡 Active Dev Proxies:')
          console.log('  ➜  /api/shop       -> http://127.0.0.1:8088')
          console.log('  ➜  /api/admin      -> http://127.0.0.1:8088 (Shop Admin)')
          console.log('  ➜  /api/payments   -> http://127.0.0.1:8088')
          console.log('  ➜  /api/inventory  -> http://127.0.0.1:8088')
          console.log('  ➜  /api/wallet     -> http://127.0.0.1:8089')
          console.log('  ➜  /api/game       -> http://127.0.0.1:8082\n')
        }, 100)
      })
    },
  }
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), proxyLoggerPlugin()],
  resolve: {
    // `@/shared/ui` instead of `../../../shared/ui`. Keep in sync with jsconfig.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // Docker bind mounts on Windows/macOS do not forward file events, so the container polls.
    watch: process.env.WATCH_POLLING === 'true' ? { usePolling: true, interval: 300 } : undefined,
    proxy: {
      '/api/game': 'http://127.0.0.1:8082',
      '/api/admin/match-settings': 'http://127.0.0.1:8082',
      '/api/admin': 'http://127.0.0.1:8088',
      '/dev/tables': 'http://127.0.0.1:8082',
      '/ws/game': { target: 'ws://127.0.0.1:8082', ws: true },
      '/api/shop': 'http://127.0.0.1:8088',
      '/api/payments': 'http://127.0.0.1:8088',
      '/api/inventory': 'http://127.0.0.1:8088',
      '/api/wallet': 'http://127.0.0.1:8089',

    },
  },
})
