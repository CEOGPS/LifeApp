import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || 'https://mhvcdstgkyplhzjptgfr.supabase.co'),
      'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY || ''),
      'import.meta.env.VITE_WORKER_URL': JSON.stringify(env.VITE_WORKER_URL || 'https://lifeos1-api.ceogps.workers.dev'),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '~': path.resolve(__dirname, './'),
      },
    },
    base: './',
    build: {
      rollupOptions: {
        external: ['@mlc-ai/web-llm'],
      },
      minify: 'esbuild',
      target: 'es2020',
    },
    server: {
      port: 3000,
    },
  };
});