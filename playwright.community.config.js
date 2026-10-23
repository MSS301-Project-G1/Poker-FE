import { defineConfig } from '@playwright/test'
import process from 'node:process'

export default defineConfig({
  testDir: './tests', testMatch: ['community.spec.js', 'matchmaking.spec.js'], workers: 1, timeout: 60000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:5297', headless: true, reducedMotion: 'reduce', screenshot: 'only-on-failure',
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  webServer: {
    command: 'npm run dev -- --host localhost --port 5297 --strictPort',
    env: { VITE_API_BASE_URL: 'http://localhost:5297', VITE_GAME_DEV_MODE: 'false' },
    url: 'http://localhost:5297', timeout: 30000, reuseExistingServer: false,
  },
})
