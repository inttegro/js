import { defineConfig } from 'tsup'
import packageMetadata from './package.json' with { type: 'json' }

export default defineConfig({
  clean: true,
  define: {
    __INTTEGRO_PACKAGE_VERSION__: JSON.stringify(packageMetadata.version),
  },
  dts: true,
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  minify: true,
  platform: 'browser',
  sourcemap: true,
  splitting: false,
  target: 'es2022',
})
