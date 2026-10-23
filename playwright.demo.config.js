import { defineConfig } from '@playwright/test'
import process from 'node:process'

export default defineConfig({
  testDir: './tests', testMatch: 'solo-demo.spec.js', workers: 1, timeout: 60000,
  use: {
    baseURL: 'http://localhost:5298', headless: true, screenshot: 'only-on-failure',
    launchOptions: {
      ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}),
      args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    },
  },
  webServer: {
    command: 'npm run dev -- --host localhost --port 5298 --strictPort',
    env: { VITE_API_BASE_URL: 'http://localhost:5298' },
    url: 'http://localhost:5298', timeout: 30000, reuseExistingServer: false,
  },
})
