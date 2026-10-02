import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { handleApi } from './server/handler.ts';
export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    plugins: [
      react(),
      {
        name: 'local-game-api',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (req.url?.startsWith('/api/')) void handleApi(req, res);
            else next();
          });
        },
      },
    ],
    server: { host: '127.0.0.1', port: 5173, strictPort: true },
    build: {
      target: 'es2022',
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('/phaser/')) return 'phaser';
            if (id.includes('/react/') || id.includes('/react-dom/')) return 'react';
            if (id.includes('/dexie/')) return 'storage';
          },
        },
      },
    },
  };
});
