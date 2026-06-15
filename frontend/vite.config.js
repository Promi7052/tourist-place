import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    execArgv: ['--no-webstorage'],
    setupFiles: './src/test/setup.ts',
    globals: true,
  },
})
