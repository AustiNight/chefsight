import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // 'base' ensures assets are loaded correctly when hosted in a subdirectory (like GitHub Pages)
  base: './', 
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
  build: {
    outDir: 'dist',
  },
  publicDir: 'public'
});
