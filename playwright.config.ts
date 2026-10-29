import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const hasStandaloneServer = fs.existsSync(path.resolve(__dirname, '.next/standalone/server.js'));
const serverCommand = process.env.CI || hasStandaloneServer ? 'node .next/standalone/server.js' : 'npm run dev';

export default defineConfig({
  testDir: './e2e',
  testIgnore: process.env.RUN_MUTATIONS === 'true' ? undefined : '**/mutations/**',
  timeout: 60 * 1000,
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    actionTimeout: 10000,
    trace: 'retain-on-failure',
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: serverCommand,
    port: 3000,
    reuseExistingServer: false,
    timeout: 120 * 1000,
    env: {
      PORT: '3000',
      GBP_PLACES_ENABLED: 'false',
      DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/dev.db',
    },
  },
});
