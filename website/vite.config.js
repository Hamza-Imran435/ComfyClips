import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Vite only exposes env vars prefixed with VITE_ to client code by
  // default; widen it so API_URL (no VITE_ prefix) is readable too.
  envPrefix: ['VITE_', 'API_'],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
})
