import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/leetcode-api': {
        target: 'https://alfa-leetcode-api.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/leetcode-api/, ''),
      },
    },
  },
})
