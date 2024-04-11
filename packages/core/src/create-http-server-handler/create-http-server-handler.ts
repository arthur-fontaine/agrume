import type Connect from 'connect'
import type { JsonValue } from 'type-fest'

import { state } from '@agrume/internals'
import { options } from '../create-route/options'

/**
 * Create the HTTP server handler with the routes.
 * @returns {Connect.NextHandleFunction} The HTTP server handler.
 */
export function createHttpServerHandler() {
  const routes = state.get()?.routes

  const middleware: Connect.NextHandleFunction
    = function (request, response, next?) {
      const throwStatus = function (status: number) {
        if (next === undefined || status.toString().startsWith('5')) {
          response.writeHead(status)
          response.end()
          return
        }

        next()
      }

      const { logger, prefix } = options.get()

      logger?.info?.(request.method, request.url)

      if (request.method !== 'POST') {
        throwStatus(405)
        return
      }

      const routeName = request.url?.replace(new RegExp(`^${prefix}`), '')

      if (routeName === undefined) {
        throwStatus(404)
        return
      }

      const route = routes?.get(routeName)

      if (route === undefined) {
        throwStatus(404)
        return
      }

      const chunks: Uint8Array[] = []
      request.on('data', (chunk) => {
        chunks.push(chunk)
      })

      request.on('end', async () => {
        // eslint-disable-next-line node/prefer-global/buffer
        const body = Buffer.concat(chunks)
        const stringifiedBody = body.toString()

        let parameters: JsonValue
        try {
          parameters = stringifiedBody === ''
            ? {}
            : JSON.parse(stringifiedBody)
        }
        catch (error) {
          throwStatus(400)
          return
        }

        let result: JsonValue
        try {
          // eslint-disable-next-line ts/no-explicit-any
          result = await route(parameters as any)
        }
        catch (error) {
          logger?.error?.(error)
          throwStatus(500)
          return
        }

        response.writeHead(200, {
          'Content-Type': 'application/json',
        })

        response.end(JSON.stringify(result))
      })
    }

  return middleware
}
