import { defineConfig } from 'vitest/config';

// Unit tests only: end-to-end tests live in e2e/ and are run by Playwright.
export default defineConfig({
  test: { include: ['tests/**/*.test.ts'] },
});
