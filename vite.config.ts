import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  // #Important: Comment the server host and port configuration before deploying to production
  server: {
    host: true,
    port: 5173
  }
})
