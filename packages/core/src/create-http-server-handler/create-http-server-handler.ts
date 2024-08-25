import type Connect from 'connect'
import type { JsonValue } from 'type-fest'
import { state } from '@agrume/internals'
import HttpErrors from 'http-errors'

import { options } from '../create-route/options'
import { handleGeneratorResponse } from './handle-generator-response'
import { handleJsonValueResponse } from './handle-json-value-response'

/**
 * Create the HTTP server handler with the routes.
 * @returns {Connect.NextHandleFunction} The HTTP server handler.
 */
export function createHttpServerHandler() {
  const middleware: Connect.NextHandleFunction
    = function (request, response, next?) {
      const routes = state.get()?.routes

      const throwStatus = function (
        status: number,
        message?: string,
        forceThrow = false,
      ) {
        if (forceThrow || next === undefined || status.toString().startsWith('5')) {
          response.writeHead(status, message)
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

      const url = request.url

      if (url === undefined) {
        throwStatus(404)
        return
      }

      if (!url.startsWith(prefix)) {
        throwStatus(404)
        return
      }

      const routeName = url.replace(new RegExp(`^${prefix}`), '')

      const route = (
        routes?.get(routeName)
        ?? (
          routeName.startsWith('/')
            ? routes?.get(routeName.slice(1))
            : undefined
        )
      )

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

        try {
          // eslint-disable-next-line ts/no-explicit-any
          const result = await route(parameters as any)

          if (isGenerator(result)) {
            handleGeneratorResponse(response, result)
          }
          else {
            handleJsonValueResponse(response, result)
          }
        }
        catch (error) {
          logger?.error?.(error)

          if (HttpErrors.isHttpError(error)) {
            return throwStatus(error.statusCode, error.message, true)
          }

          return throwStatus(500, undefined, true)
        }
      })
    }

  return middleware
}

// eslint-disable-next-line ts/no-explicit-any
function isGenerator(value: any): value is (
  | AsyncGenerator<unknown>
  | Generator<unknown>
) {
  const generatorConstructor
    = function* () { yield undefined }.constructor
  const asyncGeneratorConstructor
    = async function* () { yield undefined }.constructor

  return (
    value.constructor.constructor === generatorConstructor
    || value.constructor.constructor === asyncGeneratorConstructor
  )
}
