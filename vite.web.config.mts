import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: resolve('src/renderer'),
  base: './',
  plugins: [react()],
  build: {
    outDir: resolve('web-dist'),
    emptyOutDir: true
  }
})
