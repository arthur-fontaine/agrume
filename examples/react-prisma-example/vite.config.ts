import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { agrumePlugin } from 'vite-plugin-agrume'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    agrumePlugin({
      prefix: '/api/',
    }),
    react(),
  ],
})
