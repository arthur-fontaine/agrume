import process from 'node:process'
import path from 'node:path'
import { state } from '@agrume/internals'
import type { CliOptions } from '@agrume/types'
import fastifyExpress from '@fastify/express'
import { Bore, Localtunnel, Ngrok, Pinggy } from '@agrume/tunnel'
import cors from '@fastify/cors'
import fastify, { type FastifyInstance } from 'fastify'
import Watcher from 'watcher'

import { getAgrumeMiddleware } from './get-agrume-middleware'
import { logger } from './logger'

interface CreateServerParams {
  allowUnsafe?: boolean | undefined
  config?: CliOptions | undefined
  corsRegex?: RegExp | undefined
  entry: string
  host: string
  ngrokDomain?: string | undefined
  pinggySubdomain?: string | undefined
  pinggyToken?: string | undefined
  port: number
  tunnel?: string | undefined
  watch?: string | true | undefined
}

/**
 * Create the server.
 * @param {Parameters<typeof getAgrumeMiddleware>[0]} [params] The parameters for getting the Agrume middleware.
 * @param {boolean} [isRestarting] Whether the function was called because the server is restarting.
 * @returns {Promise<() => Promise<void>>} The close function.
 */
export async function createServer(
  params: CreateServerParams,
  isRestarting = false,
) {
  if (params.watch !== undefined || params.config?.watch === true) {
    await watchAndCreateServer(params)
    return
  }

  const server = fastify()

  if (params.corsRegex !== undefined) {
    await server.register(cors, {
      origin: params.corsRegex,
    })
  }

  const agrumeMiddleware = await getAgrumeMiddleware({
    allowUnsafe: params.allowUnsafe,
    config: params.config,
    entry: params.entry,
  })

  await server.register(fastifyExpress)
  server.use(agrumeMiddleware)

  await server.listen({ host: params.host, port: params.port })

  const { connectOptions, tunnel }
    = createNgrokTunnelInstance(params)
    ?? createLocaltunnelTunnelInstance(params)
    ?? createPinggyTunnelInstance(params)
    ?? createBoreTunnelInstance(params)
    ?? {}
  tunnel?.connect(params.port ?? params.config?.port, connectOptions ?? {})
  const tunnelUrl = tunnel?.getTunnelInfos().url

  const closeServer = async () => {
    server.server.closeAllConnections()
    await server.close()
  }

  process.on('SIGINT', async () => {
    await closeServer()
    process.exit(0)
  })

  logRoutes()
  if (!isRestarting) {
    logAddresses({ server, tunnelUrl })
  }

  if (params.tunnel !== undefined && tunnelUrl === undefined) {
    logger.warn('Tunnel registration failed, possibly due to a bad `tunnel` option')
  }

  return () => closeServer()
}

async function watchAndCreateServer(params: CreateServerParams) {
  if (params.watch === undefined && params.config?.watch !== true) {
    return
  }

  let watchTarget = path.dirname(params.entry)
  if (typeof params.watch === 'string') {
    watchTarget = params.watch
  }

  const watcher = new Watcher(watchTarget, {
    recursive: true,
  })
  logger.info(`Watching for changes in ${watchTarget}`)

  const closeServer = await createServer({
    ...params,
    config: {
      ...params.config,
      watch: undefined,
    },
    watch: undefined,
  })

  const watcherStartTime = Date.now()
  watcher.on('all', async () => {
    if (Date.now() - watcherStartTime < 1000) {
      return // Ignore initial events (1s is arbitrary)
    }

    logger.info('Detected changes, re-registering routes...')
    logger.log('')

    state.set((state) => {
      state.routes.clear()
      state.isServerPaused = true
      return state
    })

    await getAgrumeMiddleware({
      allowUnsafe: params.allowUnsafe,
      config: params.config,
      entry: params.entry,
    })

    state.set((state) => {
      state.isServerPaused = false
      return state
    })

    logRoutes()
    logger.log('')
  })

  process.on('SIGINT', async () => {
    await closeServer?.()
    process.exit(0)
  })
}

function logRoutes() {
  const routes = state.get()?.routes
  const prefix = state.get()?.options.prefix

  for (const [routeName] of routes) {
    let formattedRouteName = ''

    if (prefix !== undefined) {
      if (prefix.startsWith('/')) {
        formattedRouteName += prefix
      }
      else {
        formattedRouteName += `/${prefix}`
      }
    }

    if (formattedRouteName.endsWith('/')) {
      formattedRouteName = formattedRouteName.slice(0, -1)
    }

    if (routeName.startsWith('/')) {
      formattedRouteName += routeName
    }
    else {
      formattedRouteName += `/${routeName}`
    }

    logger.success(`Registered route \`POST ${formattedRouteName}\``)
  }
}

function logAddresses(
  { server, tunnelUrl }:
  { server: FastifyInstance, tunnelUrl?: string | undefined },
) {
  const bestAddress = getBestAddress(server)
  if (bestAddress !== undefined) {
    let text = `🍋 Server listening at: http://${bestAddress.address}:${bestAddress.port}`

    if (tunnelUrl !== undefined) {
      text += `\n🚇 Tunnel listening at: ${tunnelUrl}`
    }

    logger.box(text)
  }
}

function getBestAddress(server: FastifyInstance) {
  const addresses = server.addresses()

  const hostSorted = [
    '0.0.0.0',
    'localhost',
    '127.0.0.1',
  ]

  for (const host of hostSorted) {
    for (const address of addresses) {
      if (address.address === host) {
        return address
      }
    }
  }

  return addresses[0]
}

function createNgrokTunnelInstance(params: CreateServerParams) {
  if (params.tunnel !== 'ngrok') {
    return undefined
  }

  const ngrokAuthToken = process.env.NGROK_AUTHTOKEN
  if (ngrokAuthToken === undefined) {
    logger.error('The `ngrok` tunnel requires a `NGROK_AUTHTOKEN` environment variable. If you don\'t have yet an authtoken, go to https://dashboard.ngrok.com/tunnels/authtokens and create one.')
    process.exit(1)
  }

  if (params.ngrokDomain === undefined) {
    logger.error('The `ngrok` tunnel requires a `ngrok-domain` option. If you don\'t have yet a static domain, go to https://dashboard.ngrok.com/cloud-edge/domains and create one.')
    process.exit(1)
  }

  return {
    connectOptions: {
      accessToken: ngrokAuthToken,
    },
    tunnel: new Ngrok({
      tunnelDomain: params.ngrokDomain,
    }),
  }
}

function createPinggyTunnelInstance(params: CreateServerParams) {
  if (params.tunnel !== 'pinggy') {
    return undefined
  }

  if (params.pinggySubdomain === undefined) {
    logger.error('The `pinggy` tunnel requires a `pinggy-subdomain` option. If you don\'t have yet a subdomain, go to https://pinggy.io and create one.')
    process.exit(1)
  }

  if (params.pinggyToken === undefined) {
    logger.error('The `pinggy` tunnel requires a `pinggy-token` option. If you don\'t have yet a token, go to https://pinggy.io and create one.')
    process.exit(1)
  }

  return {
    connectOptions: {
      accessToken: params.pinggyToken,
    },
    tunnel: new Pinggy({
      tunnelSubdomain: params.pinggySubdomain,
    }),
  }
}

function createLocaltunnelTunnelInstance(params: CreateServerParams) {
  if (params.tunnel !== 'localtunnel') {
    return undefined
  }

  return { connectOptions: {}, tunnel: new Localtunnel() }
}

function createBoreTunnelInstance(params: CreateServerParams) {
  if (params.tunnel !== 'bore') {
    return undefined
  }

  return { connectOptions: {}, tunnel: new Bore() }
}
