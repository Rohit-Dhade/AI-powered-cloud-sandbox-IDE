import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1',
        changeOrigin: true,
        secure: false,
        // Force Host: localhost so nginx ingress routes /api/* correctly
        headers: {
          host: 'localhost',
        },
      },
    },
  },
})
