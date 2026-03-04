import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const API_URL = env.VITE_API_URL || 'http://localhost:5000'

  console.log('API_URL =', API_URL)

  return {
    plugins: [react()],
    server: {
      host: true,
      allowedHosts: ['.ngrok-free.app'],
      proxy: {
        '/api': {
          target: API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        //proxy api load 
        '/uploads': {
          target: API_URL,
          changeOrigin: true,
        },
      },
    },
  }
})
