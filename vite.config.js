import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/daksa-braces-tracker/',   // <<< important for GitHub Pages
})
