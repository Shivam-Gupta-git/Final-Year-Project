import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Proxy MapTiler in local dev so browser Origin is localhost (fixes 403 when the key uses “Allowed HTTP origins” without api.maptiler.com). */
const maptilerProxy = {
  '/maptiler-cloud': {
    target: 'https://api.maptiler.com',
    changeOrigin: true,
    secure: true,
    rewrite: (path) => path.replace(/^\/maptiler-cloud/, ''),
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { proxy: maptilerProxy },
  preview: { proxy: maptilerProxy },
})
