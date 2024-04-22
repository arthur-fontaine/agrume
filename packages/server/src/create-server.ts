import { state } from '@agrume/internals'
import fastifyExpress from '@fastify/express'
import fastify, { type FastifyInstance } from 'fastify'

import { getAgrumeMiddleware } from './get-agrume-middleware'
import { logger } from './logger'

interface CreateServerParams {
  entry: string
  host: string
  port: number
}

/**
 * Create the server.
 * @param {Parameters<typeof getAgrumeMiddleware>[0]} [params] The parameters for getting the Agrume middleware.
 * @returns {Promise<fastify.FastifyInstance>} The server.
 */
export async function createServer({
  entry,
  host,
  port,
}: CreateServerParams) {
  const server = fastify()
  const agrumeMiddleware = await getAgrumeMiddleware({ entry })

  await server.register(fastifyExpress)
  server.use(agrumeMiddleware)

  await server.listen({ host, port })

  logRoutes()
  logAddresses(server)
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

function logAddresses(server: FastifyInstance) {
  const bestAddress = getBestAddress(server)
  if (bestAddress !== undefined) {
    logger.box(`🍋 Server listening at: http://${bestAddress.address}:${bestAddress.port}`)
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
