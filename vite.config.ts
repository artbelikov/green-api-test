import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vitest/config'

const statsEnabled = process.env.BUILD_STATS === '1'

export default defineConfig({
  plugins: [
    react(),
    ...(statsEnabled
      ? [
          visualizer({
            filename: 'bundle-stats.html',
            gzipSize: true,
            brotliSize: true,
            sourcemap: true,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: statsEnabled,
  },
  test: {
    dir: 'src',
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/shared/**', 'src/entities/**', 'src/features/**'],
      exclude: ['**/index.ts'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
  },
})
