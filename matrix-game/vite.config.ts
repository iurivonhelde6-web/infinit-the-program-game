import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/** Em desenvolvimento, a API de compilação (Java/Python) roda dentro do próprio servidor do Vite. */
function compilerApi(): Plugin {
  return {
    name: 'matrix-compiler-api',
    async configureServer(server) {
      const { handleApi } = await import('./server/api.mjs');
      server.middlewares.use(async (req, res, next) => {
        if (!(await handleApi(req, res))) next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), compilerApi()],
});
