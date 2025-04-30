import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

// Configuration spécifique pour l'analyse des bundles
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    // Réduire la taille des fichiers
    minify: 'terser',
    // Options pour Terser
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Diviser le code en chunks pour un chargement plus rapide
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['tailwindcss']
        }
      }
    },
    // Activer la compression Brotli pour des fichiers plus petits
    brotliSize: true,
    // Réduire la taille des chunks
    chunkSizeWarningLimit: 1000
  }
})
