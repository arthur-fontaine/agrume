#!/usr/bin/env node

import { program } from 'commander'
import { createServer } from './create-server'
import { findEntryFile } from './find-entry-file'

program
  .name('agrume')
  .description('Start a server with all Agrume routes found in the project.')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('-h, --host <host>', 'Host to listen on', 'localhost')
  .option('-e, --entry <entry>', 'The entry files to search for routes', 'index.js,index.ts,index.jsx,index.tsx,main.js,main.ts,main.jsx,main.tsx,app.js,app.ts,app.jsx,app.tsx,src/index.js,src/index.ts,src/index.jsx,src/index.tsx,src/main.js,src/main.ts,src/main.jsx,src/main.tsx,src/app.js,src/app.ts,src/app.jsx,src/app.tsx')
  .option('--tunnel [tunnel]', 'Register a tunnel')
  .option('--allow-unsafe', 'Allow loading routes from node_modules')
  .action(async (options) => {
    await createServer({
      allowUnsafe: options.allowUnsafe,
      entry: findEntryFile(options.entry.split(',')),
      host: options.host,
      port: Number.parseInt(options.port),
      tunnel: options.tunnel === true ? 'localtunnel' : options.tunnel,
    })
  })
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .helpOption(true)
  .showHelpAfterError()

program.parse()
