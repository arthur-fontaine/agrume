import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { agrumePlugin } from 'vite-plugin-agrume'
import { closeServer, server } from './server'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  plugins: [
    agrumePlugin({
      logger: {
        error: (...args) => fs.writeFileSync('error.log', `${args.join(' ')}\n`, { flag: 'a' }),
        info: (...args) => fs.writeFileSync('info.log', `${args.join(' ')}\n`, { flag: 'a' }),
      },
      prefix: '/api/',
    }),
    react(),
    {
      closeBundle: closeServer,
      name: 'stop-server',
    },
  ],
})
