import { defineConfig } from 'vitest/config'
import packageMetadata from './packages/js/package.json' with { type: 'json' }

export default defineConfig({
  define: {
    __INTTEGRO_PACKAGE_VERSION__: JSON.stringify(packageMetadata.version),
  },
  test: {
    environment: 'happy-dom',
    include: ['packages/**/*.test.ts'],
    restoreMocks: true,
  },
})
