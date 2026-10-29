import { defineConfig } from '@playwright/test'

// Runs against a production build: `npm run build && npm run test:e2e`.
// BASE_URL overrides the target (never point it at production for write tests).
export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  use: { baseURL: process.env.BASE_URL || 'http://localhost:3100', locale: 'he-IL' },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npx next start -p 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: true,
    timeout: 120_000,
  },
})
