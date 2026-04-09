import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      nodePolyfills({
        protocolImports: true,
      }),
    ],

    define: {
      'global': 'globalThis',
      'process.env': JSON.stringify(env),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    server: {
      port: 5173,
      host: true,
      strictPort: true,
      historyApiFallback: true,
      // আপনার ডোমেইনগুলোকে পারমিশন দেওয়া হচ্ছে
      allowedHosts: [
        'onyx-drift.com',
        'www.onyx-drift.com'
      ]
    },

    optimizeDeps: {
      include: [
        '@mediapipe/face_mesh',
        '@mediapipe/hands',
        '@mediapipe/camera_utils',
        'react-speech-recognition',
        'regenerator-runtime/runtime'
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
      chunkSizeWarningLimit: 4000,
      commonjsOptions: {
        transformMixedEsModules: true,
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@mediapipe')) return 'mediapipe';
              return 'vendor';
            }
          }
        }
      }
    },
  };
});