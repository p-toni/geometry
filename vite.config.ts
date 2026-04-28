import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { aiProxyPlugin } from './src/plugins/vite-plugin-ai';
import { saveCanvasPlugin } from './src/plugins/vite-plugin-save';

export default defineConfig({
  plugins: [react(), tailwindcss(), saveCanvasPlugin(), aiProxyPlugin()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/framer-motion') || id.includes('/motion-dom')) {
            return 'motion-vendor';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
  },
});
