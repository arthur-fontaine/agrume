import { defineConfig } from '@agrume/cli'

// eslint-disable-next-line import/no-default-export
export default defineConfig({
  host: 'localhost',
  port: 8173,
  prefix: '/__agrume__/',
  // tunnel: {
  // type: 'localtunnel',
  // },
  watch: true,
})
