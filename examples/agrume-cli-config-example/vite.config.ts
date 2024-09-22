import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import agrumePlugin from '@agrume/plugin/vite'
import agrumeConfig from './agrume.config'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  optimizeDeps: { exclude: ['fsevents'] },
  plugins: [
    agrumePlugin({
      ...agrumeConfig,
      logger: {
        error: (...args) => fs.writeFileSync('error.log', `${args.join(' ')}\n`, { flag: 'a' }),
        info: (...args) => fs.writeFileSync('info.log', `${args.join(' ')}\n`, { flag: 'a' }),
      },
    }),
    react(),
  ],
})
