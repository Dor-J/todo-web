import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    // Suppress Angular ApplicationRef warnings (harmless cleanup warnings)
    onConsoleLog: (log, type) => {
      // Suppress NG0406 warnings from stderr
      if (log.includes('NG0406') || log.includes('ApplicationRef has already been destroyed')) {
        return false;
      }
    },
  },
});

