import { defineConfig } from '@playwright/test'
import process from 'node:process'

export default defineConfig({
  testDir: './tests', testMatch: 'game-table.spec.js', fullyParallel: false, workers: 1,
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5173', headless: true, screenshot: 'only-on-failure', trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
  },
  webServer: { command: 'npm run dev:game -- --host localhost --port 5173 --strictPort', url: 'http://localhost:5173', timeout: 30000, reuseExistingServer: false },
})
