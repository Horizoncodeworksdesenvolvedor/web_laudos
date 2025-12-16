import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // --- ADICIONE ESTE BLOCO ABAIXO ---
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001', // Use números, não 'localhost'
        changeOrigin: true,
        secure: false,
      }
    }
  }
  // ----------------------------------
})