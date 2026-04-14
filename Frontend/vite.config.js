import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      // Node.js Express backend — /api/v1/users, /api/v1/resumes, /api/v1/roadmaps, /api/v1/job-descriptions
      '/api/v1': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      // FastAPI Python backend (handles /api/chat, /api/resume, /api/users)
      '/api/chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/resume': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/interview': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    }
  }
})

