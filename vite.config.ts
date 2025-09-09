import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // 🔑 ensures relative paths in ui.html
  build: {
    rollupOptions: {
      input: {
        code: resolve(__dirname, 'src/code.ts'), // backend
        ui: resolve(__dirname, 'src/ui.html'),   // frontend entry
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
    outDir: 'dist',
    emptyOutDir: true, // clean dist on rebuild
    target: 'es2015',
  },
  define: {
    global: 'globalThis',
  },
});
