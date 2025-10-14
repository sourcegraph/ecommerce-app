import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 45000, // Increase for stability
  expect: {
    timeout: 10000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'test-results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:3001',
    headless: process.env.HEADED !== '1',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
    actionTimeout: 10000,
    // Add stability improvements
    timezoneId: 'UTC',
    locale: 'en-US',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'cd ../backend && uv run --active python -m app.seed && uv run --active uvicorn app.main:app --host 0.0.0.0 --port 8001',
      url: 'http://localhost:8001/health',
      reuseExistingServer: !!process.env.REUSE_EXISTING_SERVER || false, // Always fresh for deterministic state unless REUSE_EXISTING_SERVER is set
      timeout: 180000 // Increased timeout for CI
    },
    {
      // Use preview in CI for stability, dev locally for faster iteration
      command: process.env.CI 
        ? 'npm run build && npm run preview -- --host 0.0.0.0 --port 3001 --strictPort'
        : 'npm run dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !!process.env.REUSE_EXISTING_SERVER || !process.env.CI,
      timeout: 240000 // Increased timeout for CI build step
    }
  ],
});
