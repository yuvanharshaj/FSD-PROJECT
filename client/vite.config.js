import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Vite configuration with React plugin and backend proxy
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});

