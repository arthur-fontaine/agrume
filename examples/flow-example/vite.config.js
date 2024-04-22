import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import svgrPlugin from 'vite-plugin-svgr'
import agrumePlugin from '@agrume/plugin/vite'
import { esbuildFlowPlugin, flowPlugin } from '@bunchtogether/vite-plugin-flow'
import jsconfigPaths from 'vite-jsconfig-paths'

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      plugins: [esbuildFlowPlugin()],
    },
  },
  plugins: [
    agrumePlugin(),
    flowPlugin(),
    react(),
    jsconfigPaths(),
    svgrPlugin(),
  ],
})
