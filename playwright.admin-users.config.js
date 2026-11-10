import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests', testMatch: ['admin-users.spec.js', 'admin-routing.spec.js'], fullyParallel: false, workers: 1,
  timeout: 25000,
  use: { baseURL: 'http://localhost:5187', headless: true },
  webServer: {
    command: 'npm run dev -- --host localhost --port 5187 --strictPort',
    url: 'http://localhost:5187', timeout: 30000, reuseExistingServer: false,
  },
})
