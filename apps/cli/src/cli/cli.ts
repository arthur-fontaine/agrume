#!/usr/bin/env node

import { utils } from '@agrume/internals'
import { program } from 'commander'
import { createServer } from './create-server'
import { findEntryFile } from './find-entry-file'

program
  .name('agrume')
  .description('Start a server with all Agrume routes found in the project.')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('-h, --host <host>', 'Host to listen on', 'localhost')
  .option('-e, --entry <entry>', 'The entry files to search for routes', 'index.js,index.ts,index.jsx,index.tsx,main.js,main.ts,main.jsx,main.tsx,app.js,app.ts,app.jsx,app.tsx,src/index.js,src/index.ts,src/index.jsx,src/index.tsx,src/main.js,src/main.ts,src/main.jsx,src/main.tsx,src/app.js,src/app.ts,src/app.jsx,src/app.tsx')
  .option('--watch [target]', 'Watch for changes in the target directory')
  .option('--tunnel [tunnel]', 'Register a tunnel')
  .option('--ngrok-domain <domain>', 'The domain for the ngrok tunnel')
  .option('--pinggy-token <token>', 'The access token for your Pinggy persistent domain')
  .option('--pinggy-domain <domain>', 'The domain for the Pinggy persistent domain')
  .option('--cors-regex <regex>', 'The regex for the CORS origin')
  .option('--allow-unsafe', 'Allow loading routes from node_modules')
  .action(async (options) => {
    const config = await utils.readConfig()

    await createServer({
      allowUnsafe: options.allowUnsafe,
      config,
      corsRegex:
        options.corsRegex !== undefined ? new RegExp(options.corsRegex)
        : config.corsRegex !== undefined
          ? typeof config.corsRegex === 'string' ? new RegExp(config.corsRegex)
          : config.corsRegex
          : undefined,
      entry: findEntryFile(options.entry.split(',')),
      host: options.host,
      ngrokDomain: options.ngrokDomain ?? (config.tunnel?.type === 'ngrok' ? config.tunnel.domain : undefined),
      pinggyDomain: options.pinggyDomain ?? (config.tunnel?.type === 'pinggy' ? config.tunnel.domain : undefined),
      pinggyToken: options.pinggyToken ?? (config.tunnel?.type === 'pinggy' ? config.tunnel.accessToken : undefined),
      port: Number.parseInt(options.port),
      tunnel: options.tunnel === true ? 'localtunnel' : options.tunnel ?? config.tunnel?.type,
      watch: options.watch,
    })
  })
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .helpOption(true)
  .showHelpAfterError()

program.parse()
