import { Readable, Transform } from 'node:stream'
import type { TransformStream } from 'node:stream/web'
import type Connect from 'connect'
import type { JsonValue } from 'type-fest'
import { state } from '@agrume/internals'

import { options } from '../create-route/options'
import { handleGeneratorResponse } from './handle-generator-response'
import { handleJsonValueResponse } from './handle-json-value-response'

const bodyStreams = new Map<string, TransformStream<Uint8Array>>()
function createEmptyBodyStream() {
  return Transform.toWeb(new Transform({
    transform(chunk, _encoding, callback) {
      this.push(chunk)
      callback()
    },
  }))
}

/**
 * Create the HTTP server handler with the routes.
 * @returns {Connect.NextHandleFunction} The HTTP server handler.
 */
export function createHttpServerHandler() {
  const middleware: Connect.NextHandleFunction
    = function (request, response, next?) {
      const routes = state.get()?.routes

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

      const agrumeRid = request.headers['x-agrume-rid-stream']
      const AGRUME_SEND_STREAM_PATH = '/__agrume_send_stream'
      const realRouteNameForKey = routeName.endsWith(AGRUME_SEND_STREAM_PATH)
        ? routeName.slice(0, -AGRUME_SEND_STREAM_PATH.length)
        : routeName
      const requestKey = agrumeRid !== undefined && typeof agrumeRid === 'string'
        ? `${realRouteNameForKey}:${agrumeRid}`
        : undefined

      if (requestKey !== undefined && routeName.endsWith('/__agrume_send_stream')) {
        const routeStream
          = bodyStreams.get(requestKey) ?? createEmptyBodyStream()
        bodyStreams.set(requestKey, routeStream)

        Readable
          .toWeb(request)
          .pipeTo(routeStream.writable)

        return
      }

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

      const isBodyStream = request.headers['content-type'] === 'application/octet-stream'

      if (requestKey !== undefined || isBodyStream) {
        let stream: ReadableStream<Uint8Array>

        if (requestKey !== undefined) {
          const bodyStream
            = bodyStreams.get(requestKey) ?? createEmptyBodyStream()
          bodyStreams.set(requestKey, bodyStream)
          stream = bodyStream.readable
            .pipeThrough(new TextDecoderStream() as never) as never
        }
        else /* isBodyStream === true */ {
          stream = Readable
            .toWeb(request)
            .pipeThrough(new TextDecoderStream() as never) as never
        }

        (async () => {
          const result = await route(stream as never)
          if (isGenerator(result)) {
            handleGeneratorResponse(response, result)
          }
          else {
            handleJsonValueResponse(response, result)
          }
        })()

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
          throwStatus(500)
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
