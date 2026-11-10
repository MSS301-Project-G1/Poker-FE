import { defineConfig } from '@playwright/test'
import community from './playwright.community.config.js'

export default defineConfig({
  ...community,
  testMatch: 'live-table.spec.js',
  use: { ...community.use, reducedMotion: 'no-preference', viewport: { width: 1440, height: 1000 } },
})
