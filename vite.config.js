import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    mimeTypes: {
      'text/jsx': 'application/javascript'
    }
  },
  esbuild: {
    loader: 'jsx',
    include: /\.(js|jsx)$/
  }
})
