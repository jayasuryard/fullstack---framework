import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Split heavy vendor libs into cached chunks. Recharts/react-calendar
        // are deps but unused in src — tree-shaken out, no chunk emitted.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-anim': ['framer-motion'],
          'vendor-icons': ['react-icons', 'lucide-react', '@phosphor-icons/react'],
        },
      },
    },
  },
})
