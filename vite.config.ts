import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { aiProxyPlugin } from './src/plugins/vite-plugin-ai';
import { saveCanvasPlugin } from './src/plugins/vite-plugin-save';

export default defineConfig({
  plugins: [react(), tailwindcss(), saveCanvasPlugin(), aiProxyPlugin()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
