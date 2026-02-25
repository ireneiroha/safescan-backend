import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    svgr(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://safescan-backend-1.onrender.com',
        changeOrigin: true,
        secure: true,
      }
    }
  }
})