import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    define: {
      'global': 'globalThis',
      'process.env': JSON.stringify(env),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        // প্রোডাকশন লেভেল পলিফিলস
        'util': 'util/', 
        'stream': 'stream-browserify',
        'buffer': 'buffer',
        'events': 'events',
        'process': 'process/browser',
      },
    },

    server: {
      port: 5173,
      host: true, 
      strictPort: true,
      historyApiFallback: true, 
      
      // ডোমেইন সিকিউরিটি পারমিশন
      allowedHosts: [
        'onyx-drift.com',
        'www.onyx-drift.com',
        '.onyx-drift.com'
      ],

      // HMR (Hot Module Replacement) - স্টেবল কানেকশন ফিক্স
      hmr: {
        host: 'onyx-drift.com',
        protocol: 'wss', // HTTPS এর জন্য সুরক্ষিত কানেকশন
        clientPort: 443, 
      }
    },

    optimizeDeps: {
      include: [
        'buffer', 
        'stream-browserify', 
        'events',
        'util',
        'process'
        // MediaPipe ডিলিট করা হয়েছে
      ],
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },

    build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 2000, // লিমিট কমিয়ে অপ্টিমাইজ করা হয়েছে
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor'; // লাইব্রেরিগুলোকে আলাদা চাঙ্কে ভাগ করা হয়েছে
            }
          }
        }
      }
    },
  };
});