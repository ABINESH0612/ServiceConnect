import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api/v1/catalog': {
        target: 'http://localhost:8086',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1\/catalog/, '/api/catalog'),
      },
      '/api/v1/providers': {
        target: 'http://localhost:8084',
        changeOrigin: true,
      },
      '/api/users': {
        target: 'http://localhost:8082',
        changeOrigin: true,
      },
      '/api/payments': {
        target: 'http://localhost:8088',
        changeOrigin: true,
      },
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
