import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/main.ts'],
  outDir: 'dist',
  format: ['cjs'],
  sourcemap: true,
  dts: true,
  clean: true,
  minify: false,
  target: 'node20',
  watch: ['src'],
  onSuccess: 'node --enable-source-maps dist/main.js',
})
