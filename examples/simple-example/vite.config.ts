import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { agrume } from 'vite-plugin-agrume'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    jsxRuntime: 'classic',
  }), agrume()],
})
