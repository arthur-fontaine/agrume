import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { agrume } from 'vite-plugin-agrume'
import { closeServer, server } from './server'

import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    agrume({
      prefix: '/api/',
      server,
      logger: {
        info: (...args) => fs.writeFileSync('info.log', args.join(' ') + '\n', { flag: 'a' }),
        error: (...args) => fs.writeFileSync('error.log', args.join(' ') + '\n', { flag: 'a' }),
      },
    }),
    react(),
    {
      name: 'stop-server',
      closeBundle: closeServer,
    },
  ],
})
