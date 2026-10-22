import { defineConfig } from '@playwright/test'
import process from 'node:process'

export default defineConfig({
  testDir: './tests', testMatch: 'matchmaking.spec.js', workers: 1,
  use: {
    baseURL: 'http://localhost:5187', headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
  },
  webServer: {
    command: 'npm run dev -- --host localhost --port 5187 --strictPort',
    env: { VITE_API_BASE_URL: 'http://localhost:5187', VITE_GAME_DEV_MODE: 'false' },
    url: 'http://localhost:5187', timeout: 30000, reuseExistingServer: false,
  },
})
