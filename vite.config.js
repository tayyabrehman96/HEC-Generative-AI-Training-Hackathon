import { defineConfig } from 'vite';

/** When nothing listens on :3001, http-proxy surfaces a vague client error — return JSON so the UI can explain. */
function attachProxyBridgeErrors(proxy) {
  proxy.on('error', (_err, _req, res) => {
    if (!res || res.writableEnded) return;
    if (typeof res.writeHead !== 'function') return;
    if (res.headersSent) return;
    const body = JSON.stringify({
      ok: false,
      service: 'vite-proxy-bridge',
      error:
        'Backend unreachable on http://127.0.0.1:3001. Run `npm run proxy` or `npm run dev:all`; ensure `.env` has REGOLO_API_KEY and port 3001 is not used by another app.',
    });
    res.writeHead(503, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
    res.end(body);
  });
}

/** Forward /proxy → Express on 3001 so the browser stays same-origin (avoids localhost vs 127.0.0.1 fetch failures). */
const proxyToBackend = {
  '/proxy': {
    target: 'http://127.0.0.1:3001',
    changeOrigin: true,
    configure(proxy) {
      attachProxyBridgeErrors(proxy);
    },
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
