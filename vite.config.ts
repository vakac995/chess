import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
  },
  base: './',
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/features': path.resolve(__dirname, 'src/features'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/context': path.resolve(__dirname, 'src/context'),
      '@/atoms': path.resolve(__dirname, 'src/atoms'),
      '@/schemas': path.resolve(__dirname, 'src/schemas'),
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
