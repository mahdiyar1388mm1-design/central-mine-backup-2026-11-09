import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // The admin console uses its own CSS layer. Keeping the Vite runtime on the
  // React plugin avoids the optional native lightningcss binding on Windows.
  plugins: [react()],
  server: {
    // Bind to all interfaces so `npm run dev` is reachable from outside a
    // Docker container (see docker-compose.dev.yaml). Harmless for plain
    // local dev too — still served at http://localhost:5173.
    host: true,
    port: 5173,
  },
})
