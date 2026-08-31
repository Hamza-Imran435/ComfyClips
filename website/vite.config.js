import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://darkcyan-wren-793766.hostingersite.com',
        changeOrigin: true,
      },
    },
  },
})
