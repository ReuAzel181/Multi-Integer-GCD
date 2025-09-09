import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      // Custom plugin to create self-contained HTML with inlined JS
      name: 'inline-js-html',
      writeBundle() {
        if (!existsSync('dist')) {
          mkdirSync('dist', { recursive: true });
        }
        
        // Read the generated JS file
        const jsContent = readFileSync('dist/ui.js', 'utf-8');
        
        // Create HTML with inlined JavaScript
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Shortcuts Plugin</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8f8f8;
    }
    
    * {
      box-sizing: border-box;
    }
    
    #react-page {
      width: 100%;
      height: 100%;
    }
  </style>
</head>
<body>
  <div id="react-page"></div>
  <script>
${jsContent}
  </script>
</body>
</html>`;
        
        // Write the self-contained HTML file
        writeFileSync('dist/ui.html', htmlContent);
      }
    }
  ],
  build: {
    rollupOptions: {
      input: resolve(__dirname, 'src/ui.tsx'),
      output: {
        entryFileNames: 'ui.js',
        format: 'iife',
        name: 'FigmaPlugin'
      }
    },
    outDir: 'dist',
    emptyOutDir: false,
    target: 'es2015'
  },
  base: './',
  define: {
    global: 'globalThis'
  }
});
