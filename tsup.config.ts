import {defineConfig} from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tunetags: 'src/bin/tunetags.ts'
  },
  splitting: true,
  minify: false,
  clean: true,
  shims: true,
  outDir: 'dist',
  format: 'esm',
  sourcemap: true,
  dts: true
})
