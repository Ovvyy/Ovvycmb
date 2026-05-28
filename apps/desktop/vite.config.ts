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
    port: 5173,
    proxy: {
      '/api': 'http://localhost:7337',
      '/hub': {
        target: 'ws://localhost:7337',
        ws: true,
      },
    },
  },
  build: {
    outDir: '../../src/Ovvycmb.App/wwwroot',
    emptyOutDir: true,
  },
})
