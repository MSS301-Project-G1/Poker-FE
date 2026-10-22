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
          for (const [path, proxy] of Object.entries(server.config.server.proxy ?? {})) {
            const target = typeof proxy === 'string' ? proxy : proxy.target
            const websocket = typeof proxy === 'object' && proxy.ws ? ' (WebSocket)' : ''
            console.log(`  ➜  ${path.padEnd(26)} -> ${target}${websocket}`)
          }
          console.log()
        }, 100)
      })
    },
  }
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), proxyLoggerPlugin()],
  build: {
    rolldownOptions: {
      input: {
        app: fileURLToPath(new URL('./index.html', import.meta.url)),
        demo: fileURLToPath(new URL('./demo/poker.html', import.meta.url)),
      },
    },
  },
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
      // Must stay above the '/api/admin' catch-all: Vite uses the first matching prefix.
      '/api/admin/seasons': 'http://127.0.0.1:8086',
      '/api/admin/tournaments': 'http://127.0.0.1:8087',
      '/api/admin': 'http://127.0.0.1:8088',
      '/dev/tables': 'http://127.0.0.1:8082',
      '/ws/game': { target: 'ws://127.0.0.1:8082', ws: true },
      '/api/matchmaking': 'http://127.0.0.1:8083',
      '/api/party': 'http://127.0.0.1:8083',
      '/api/friends': 'http://127.0.0.1:8084',
      '/api/blocks': 'http://127.0.0.1:8084',
      '/ws/social': { target: 'ws://127.0.0.1:8084', ws: true },
      '/api/chat': 'http://127.0.0.1:8085',
      '/ws/chat': { target: 'ws://127.0.0.1:8085', ws: true },
      '/api/ranking': 'http://127.0.0.1:8086',
      '/api/seasons': 'http://127.0.0.1:8086',
      '/api/tutorial': 'http://127.0.0.1:8086',
      '/api/rooms': 'http://127.0.0.1:8087',
      '/api/tournaments': 'http://127.0.0.1:8087',
      '/api/shop': 'http://127.0.0.1:8088',
      '/api/payments': 'http://127.0.0.1:8088',
      '/api/inventory': 'http://127.0.0.1:8088',
      '/api/wallet': 'http://127.0.0.1:8089',

    },
  },
})
