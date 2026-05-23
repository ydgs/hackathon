import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy /api/v1 requests to the backend during development
      // Backend runs on https://localhost:7000
      '/api': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'https://localhost:7000',
        changeOrigin: true,
        secure: false,
      },
      // OCPP simulator — http://localhost:3000/api/
      // Frontend calls /ocpp/api/... → http://localhost:3000/api/...
      '/ocpp': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ocpp/, ''),
      },
    },
  },
})
