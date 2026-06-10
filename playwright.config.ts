import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'https://new-test-zeta-two.vercel.app', headless: true },
});
