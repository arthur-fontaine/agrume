import { state } from '@agrume/internals'
import fastifyExpress from '@fastify/express'
import fastify, { type FastifyInstance } from 'fastify'

import { getAgrumeMiddleware } from './get-agrume-middleware'
import { logger } from './logger'
import { registerTunnel } from './register-tunnel'

interface CreateServerParams {
  allowUnsafe?: boolean | undefined
  entry: string
  host: string
  port: number
  tunnel?: string | undefined
}

/**
 * Create the server.
 * @param {Parameters<typeof getAgrumeMiddleware>[0]} [params] The parameters for getting the Agrume middleware.
 * @returns {Promise<fastify.FastifyInstance>} The server.
 */
export async function createServer({
  allowUnsafe,
  entry,
  host,
  port,
  tunnel,
}: CreateServerParams) {
  const server = fastify()
  const agrumeMiddleware = await getAgrumeMiddleware({
    entry,
    ...(allowUnsafe !== undefined ? { allowUnsafe } : {}),
  })

  await server.register(fastifyExpress)
  server.use(agrumeMiddleware)

  await server.listen({ host, port })

  const {
    url: tunnelUrl,
  } = await registerTunnel({ host, port, tunnel })

  logRoutes()
  logAddresses({ server, tunnelUrl })

  if (tunnel !== undefined && tunnelUrl === undefined) {
    logger.warn('Tunnel registration failed, possibly due to a bad `tunnel` option')
  }
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
