#!/usr/bin/env node

import { utils } from '@agrume/internals'
import { Tunnel } from '@agrume/tunnel'
import { program } from 'commander'
import { createServer } from './create-server'
import { findEntryFile } from './find-entry-file'
import { buildCommand } from './commands/build-command'
import { entryOption } from './options/entry-option'

program
  .name('agrume')
  .description('Start a server with all Agrume routes found in the project.')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('-h, --host <host>', 'Host to listen on', 'localhost')
  .addOption(entryOption)
  .option('--watch [target]', 'Watch for changes in the target directory')
  .option('--tunnel [tunnel]', 'Register a tunnel')
  .option('--ngrok-domain <domain>', 'The domain for the ngrok tunnel')
  .option('--pinggy-token <token>', 'The access token for your Pinggy persistent domain')
  .option('--pinggy-subdomain <subdomain>', 'The subdomain for the Pinggy persistent domain')
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
      ngrokDomain: (
        options.ngrokDomain
        ?? (
          !(config.tunnel instanceof Tunnel) && config.tunnel?.type === 'Ngrok' ? config.tunnel.tunnelDomain
          : undefined
        )
      ),
      pinggySubdomain: (
        options.pinggySubdomain
        ?? (
          !(config.tunnel instanceof Tunnel) && config.tunnel?.type === 'Pinggy' ? config.tunnel.tunnelSubdomain
          : undefined
        )
      ),
      pinggyToken: (
        options.pinggyToken
        ?? (
          !(config.tunnel instanceof Tunnel) && config.tunnel?.type === 'Pinggy' ? config.tunnel.connectionArgs.accessToken
          : undefined
        )
      ),
      port: Number.parseInt(options.port),
      tunnel: options.tunnel === true ? 'localtunnel' : options.tunnel ?? config.tunnel?.type.toLowerCase(),
      watch: options.watch,
    })
  })
  .addCommand(buildCommand)
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .helpOption(true)
  .showHelpAfterError()

program.parse()
