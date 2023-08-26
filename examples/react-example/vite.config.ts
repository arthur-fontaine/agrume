import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { agrume } from 'vite-plugin-agrume'
import { closeServer, server } from './server'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    agrume({
      prefix: '/api/',
      server,
    }),
    react(),
    {
      name: 'stop-server',
      closeBundle: closeServer,
    },
  ],
})
