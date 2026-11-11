import { defineConfig } from '@playwright/test'
import process from 'node:process'

export default defineConfig({
  testDir: './tests', testMatch: 'avatar-upload.spec.js', fullyParallel: false, workers: 1,
  timeout: 25000,
  use: {
    baseURL: 'http://localhost:5195', headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
  },
  webServer: {
    command: 'npm run dev -- --host localhost --port 5195 --strictPort',
    url: 'http://localhost:5195', timeout: 30000, reuseExistingServer: false,
  },
})
