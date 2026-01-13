import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React - needed everywhere
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Icons - frequently used
          'vendor-icons': ['lucide-react'],
          // Drag and drop - only needed for block editor
          'vendor-dnd': ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend', 'react-dnd-multi-backend'],
        },
      },
    },
  },
  server: {
    port: 3000,
  },
})
