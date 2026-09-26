import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Tests run against the production build so redirects, the generated PDF,
  // and built assets are covered. Run `npm run build` first.
  webServer: {
    command: 'npx astro preview --port 4321',
    url: 'http://localhost:4321',
    // Never reuse: a running dev server would be tested instead of the build.
    reuseExistingServer: false,
    timeout: 120 * 1000,
  },
});