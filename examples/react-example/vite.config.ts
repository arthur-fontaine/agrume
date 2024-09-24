import fs from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import agrumePlugin from '@agrume/plugin/vite'
import { closeServer, server } from './server'

// https://vitejs.dev/config/
// eslint-disable-next-line import/no-default-export
export default defineConfig({
  optimizeDeps: {
    exclude: ['agrume'],
  },
  plugins: [
    agrumePlugin({
      logger: {
        error: (...args) => fs.writeFileSync('error.log', `${args.join(' ')}\n`, { flag: 'a' }),
        info: (...args) => fs.writeFileSync('info.log', `${args.join(' ')}\n`, { flag: 'a' }),
      },
      prefix: '/api/',
      // or useMiddleware: (middleware) => server.use(middleware),
      useMiddleware: server.use.bind(server),
    }),
    react(),
    {
      closeBundle: closeServer,
      name: 'stop-server',
    },
  ],
})
