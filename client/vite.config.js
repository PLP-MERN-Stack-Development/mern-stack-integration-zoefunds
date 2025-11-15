import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      '/uploads': {
        target: process.env.VITE_API_BASE ? process.env.VITE_API_BASE.replace('/api', '') : 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
});