import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// base: './' keeps asset paths relative, so the build works on
// GitHub Pages (user or project site) and on Vercel without changes.
export default defineConfig({
  plugins: [react()],
  base: './',
})
