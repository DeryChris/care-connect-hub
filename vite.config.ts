// vite.config.ts
// CRITICAL FIX: The Vite proxy must be configured with `cookieDomainRewrite`
// so the httpOnly refresh_token cookie set by the backend (localhost:3001) is
// stored on localhost:5173 (the browser's origin for the dev server).
// Without this, the browser never receives the cookie and every page refresh
// hits /auth/refresh with no cookie → gets 401 → redirects to login.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,   // bind to 0.0.0.0 so the app is reachable on the local network
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        // Rewrite the cookie domain so the browser stores it on localhost:5173
        cookieDomainRewrite: {
          'localhost:3001': 'localhost',
          '*': 'localhost',
        },
        // Also handle the cookie path — backend sets path: '/api/auth'
        // The browser needs to send it on all /api/auth/* requests from 5173
      },
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));