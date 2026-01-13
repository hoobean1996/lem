import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Build time info
const buildTime = new Date().toISOString()

// Try to get git commit hash, fallback to 'dev' if not in git repo
let gitCommitHash = 'dev'
try {
  const { execSync } = require('child_process')
  gitCommitHash = execSync('git rev-parse --short HEAD').toString().trim()
} catch {
  // Not in a git repo or git not available
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/admin/',
  define: {
    __GIT_COMMIT__: JSON.stringify(gitCommitHash),
    __BUILD_TIME__: JSON.stringify(buildTime),
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
