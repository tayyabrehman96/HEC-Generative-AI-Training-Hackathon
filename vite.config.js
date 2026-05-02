import { defineConfig } from 'vite';

/** Forward /proxy → Express on 3001 so the browser stays same-origin (avoids localhost vs 127.0.0.1 fetch failures). */
const proxyToBackend = {
  '/proxy': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
  },
};

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: false,
    open: true,
    proxy: proxyToBackend,
    // Avoid full dev-server restart when only server-side secrets in .env change (was killing concurrently + proxy).
    watch: {
      ignored: ['**/.env', '**/.env.*'],
    },
  },
  preview: {
    proxy: proxyToBackend,
  },
});
