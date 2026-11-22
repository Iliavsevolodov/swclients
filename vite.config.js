import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  base: '/swclients/docs/',
  build: {
    rollupOptions: { input: resolve(process.cwd(), 'app/index.html') }
  }
})
