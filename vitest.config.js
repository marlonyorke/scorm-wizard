import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Algemene configuratie
    environment: 'node',
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    
    // Timeout voor tests (in milliseconden)
    testTimeout: 10000,
    
    // Parallelisatie
    threads: true,
    
    // Coverage configuratie
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/node_modules/**',
        '**/*.d.ts',
        '**/*.test.{js,ts}',
        '**/*.spec.{js,ts}',
        '**/vite.config.ts',
        '**/vitest.config.ts',
      ],
    },
    
    // Reporter configuratie
    reporters: ['default', 'html'],
    
    // Globals
    globals: true,
  },
});
