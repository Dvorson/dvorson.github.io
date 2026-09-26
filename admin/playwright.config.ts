import { defineConfig, devices } from '@playwright/test'
import os from 'os'
import path from 'path'

// The dev server writes posts and images here instead of into ../site. The
// directory is outside any git repository, so publish's git commands fail
// harmlessly instead of committing test content.
export const E2E_ROOT = path.join(os.tmpdir(), 'dvorson-admin-e2e')
export const E2E_POSTS_DIR = path.join(E2E_ROOT, 'posts')
export const E2E_IMAGES_DIR = path.join(E2E_ROOT, 'images')

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    timeout: 120_000,
    env: { POSTS_DIR: E2E_POSTS_DIR, IMAGES_DIR: E2E_IMAGES_DIR },
  },
})
