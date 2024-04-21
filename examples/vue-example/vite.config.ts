import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import agrumePlugin from '@agrume/plugin/vite'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    agrumePlugin(),
    vue(),
  ],
})
