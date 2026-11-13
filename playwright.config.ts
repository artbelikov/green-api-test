import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  forbidOnly: true,
  retries: process.env.CI ? 2 : 0,
  fullyParallel: false,
  use: {
    baseURL: 'http://localhost:5173',
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: 'pnpm dev --port 5173 --strictPort',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    env: { VITE_API_MODE: 'mock' },
  },
})
