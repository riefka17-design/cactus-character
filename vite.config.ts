import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['@supabase/supabase-js', 'qrcode'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
    },
  },
});