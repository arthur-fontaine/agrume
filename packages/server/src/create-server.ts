import process from 'node:process'
import path from 'node:path'
import { state } from '@agrume/internals'
import fastifyExpress from '@fastify/express'
import fastify, { type FastifyInstance } from 'fastify'
import Watcher from 'watcher'

import { getAgrumeMiddleware } from './get-agrume-middleware'
import { logger } from './logger'
import { registerTunnel } from './register-tunnel'

interface CreateServerParams {
  allowUnsafe?: boolean | undefined
  entry: string
  host: string
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
  if (params.watch !== undefined) {
    await watchAndCreateServer(params)
    return
  }

  const server = fastify()
  const agrumeMiddleware = await getAgrumeMiddleware({
    entry: params.entry,
    ...(params.allowUnsafe !== undefined
      ? { allowUnsafe: params.allowUnsafe }
      : {}),
  })

  await server.register(fastifyExpress)
  server.use(agrumeMiddleware)

  await server.listen({ host: params.host, port: params.port })

  const {
    url: tunnelUrl,
  } = await registerTunnel({
    host: params.host,
    port: params.port,
    tunnel: params.tunnel,
  })

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
  if (params.watch === undefined) {
    return
  }

  let watchTarget = params.watch
  if (watchTarget === true) {
    watchTarget = path.dirname(params.entry)
  }

  const watcher = new Watcher(watchTarget)
  logger.info(`Watching for changes in ${watchTarget}`)

  let closeServer = await createServer({
    ...params,
    watch: undefined,
  })

  const watcherStartTime = Date.now()
  watcher.on('all', async () => {
    if (Date.now() - watcherStartTime < 1000) {
      return // Ignore initial events (1s is arbitrary)
    }

    state.set((state) => {
      state.routes.clear()
      return state
    })

    logger.info('Detected changes, restarting server...')
    await closeServer?.()
    closeServer = await createServer({
      ...params,
      tunnel: undefined,
      watch: undefined,
    }, true)
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

    logger.info(`Registered route \`POST ${formattedRouteName}\``)
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
