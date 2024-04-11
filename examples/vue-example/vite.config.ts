import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { agrume } from 'vite-plugin-agrume'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    agrume(),
    vue()
  ],
})
