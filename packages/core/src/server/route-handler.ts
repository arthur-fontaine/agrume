import { Readable } from 'node:stream'
import { state } from '@agrume/internals'
import type { AnyRoute, RouteReturnValue } from '@agrume/types'
import type { JsonValue } from 'type-fest'
import HttpErrors from 'http-errors'
import { options } from '../client/options'
import type { Middleware } from './middleware'
import { constants } from './constants'

/**
 * The logic to handle Agrume routes.
 */
export class RouteHandler {
  prefix = options.get().prefix

  /**
   * Create a new middleware context.
   * @param {Middleware} middleware The middleware.
   * @param {MiddlewareRequest} request The request.
   * @param {MiddlewareResponse} response The response.
   * @param {() => void} next The next middleware.
   */
  constructor(
    public middleware: Middleware,
    public request: MiddlewareRequest,
    public response: MiddlewareResponse,
    public next?: () => void,
  ) { }

  /**
   * Get the request body as an async generator.
   * @returns {() => AsyncGenerator<Uint8Array, void, unknown>} The request body.
   */
  async getRequestBodyAsyncGenerator():
  Promise<(() => AsyncGenerator<Uint8Array, void, unknown>) | undefined> {
    const stream = await this.getRequestBodyStream()
    if (stream === undefined) {
      return
    }

    return async function* () {
      const reader = stream.getReader()

      while (true) {
        const { done, value } = await reader.read()

        if (value !== undefined) {
          const YIELD_PREFIX = 'YIELD'
          const RETURN_PREFIX = 'RETURN'

          if (value.startsWith(YIELD_PREFIX)) {
            yield JSON.parse(value.slice(YIELD_PREFIX.length))
          }
          else if (value.startsWith(RETURN_PREFIX)) {
            return JSON.parse(value.slice(RETURN_PREFIX.length))
          }
          else {
            console.error('Unexpected value:', value)
          }
        }

        if (done) {
          return
        }
      }
    }
  }

  /**
   * Get the request body as a JSON object.
   * @returns {Promise<JsonValue>} The request body.
   */
  async getRequestBodyJson(): Promise<JsonValue> {
    return new Promise((resolve, reject) => {
      const chunks: Uint8Array[] = []
      this.request.body.stream.on('data', (chunk) => {
        chunks.push(chunk)
      })

      this.request.body.stream.on('end', async () => {
        // eslint-disable-next-line node/prefer-global/buffer
        const body = Buffer.concat(chunks)
        const stringifiedBody = body.toString()

        try {
          resolve(stringifiedBody === '' ? {} : JSON.parse(stringifiedBody))
        }
        catch (error) {
          this.throwStatus(400, 'Invalid JSON body', true)
          reject(error)
        }
      })
    })
  }

  /**
   * Return the body of the request as a stream.
   * @returns {Promise<Readable | undefined>} The request stream.
   */
  async getRequestBodyStream(): Promise<ReadableStream<string> | undefined> {
    const requestKey = this.getRequestKey()
    const isBodyStream = this.request.headers['content-type'] === 'application/octet-stream'

    if (requestKey !== undefined) {
      const routeStream = await this.middleware.getRouteStream(requestKey)
      return routeStream.readable
        .pipeThrough(new TextDecoderStream() as never) as never
    }

    if (isBodyStream) {
      return Readable
        .toWeb(this.request.body.stream)
        .pipeThrough(new TextDecoderStream() as never) as never
    }

    return undefined
  }

  /**
   * Return the request key.
   * @returns {string | undefined} The request key.
   */
  getRequestKey(): string | undefined {
    const agrumeRid = this.request.headers['x-agrume-rid-stream']
    if (agrumeRid === undefined) {
      return
    }

    const routeName = this.getRouteName()

    return agrumeRid !== undefined && typeof agrumeRid === 'string'
      ? `${this.removeSendStreamFromPath(routeName)}:${agrumeRid}`
      : undefined
  }

  /**
   * Get the route name.
   * @returns {string} The route name.
   */
  getRouteName(): string {
    return this.request.url.replace(new RegExp(`^${this.prefix}`), '')
  }

  /**
   * Send the response to the client based on the generator's next value.
   * @param {Generator} generator The generator.
   */
  async handleGeneratorResponse(
    generator: Extract<RouteReturnValue, AsyncGenerator | Generator>,
  ): Promise<void> {
    this.response.setHeader('Cache-Control', 'no-cache')
    this.response.setHeader('Content-Type', 'text/event-stream')
    this.response.setHeader('Access-Control-Allow-Origin', '*')
    this.response.setHeader('Connection', 'keep-alive')
    this.response.flushHeaders() // flush the headers to establish SSE with client

    while (true) {
      const { done, value } = await generator.next()

      if (done) {
        if (value !== undefined) {
          this.response.write(`data: RETURN${JSON.stringify(value)}\n\n`)
        }

        this.response.write('DONE\n\n')
        this.response.end()
        return
      }

      this.response.write(`data: ${JSON.stringify(value)}\n\n`)
    }
  }

  /**
   * Send the response to the client based on the generator's next value.
   * @param {object} jsonValue The JSON value.
   */
  handleJsonValueResponse(
    jsonValue: Awaited<Extract<RouteReturnValue, Promise<unknown>>>,
  ): void {
    this.response.setHeader('Content-Type', 'application/json')

    if (jsonValue === undefined || jsonValue === null) {
      this.response.writeHead(204)
      this.response.end()
      return
    }

    this.response.writeHead(200)
    this.response.end(JSON.stringify(jsonValue))
  }

  /**
   * Find the route that matches the request.
   * @returns {Promise<AnyRoute | undefined>} The route.
   */
  async matchRoute(): Promise<AnyRoute | undefined> {
    const routes = state.get()?.routes
    if (this.request.method !== 'POST') {
      this.throwStatus(405)
      return
    }

    if (
      this.request.url === undefined
        || !this.request.url.startsWith(this.prefix)
    ) {
      this.throwStatus(404)
      return
    }

    const routeName = this.getRouteName()
    const route = (
      routes?.get(routeName)
      ?? (
        routeName.startsWith('/')
          ? routes?.get(routeName.slice(1))
          : undefined
      )
    )

    if (route === undefined) {
      this.throwStatus(404)
      return
    }

    return route
  }

  /**
   * Remove the send stream from the path.
   * @param {string} routeName The route name.
   * @returns {string} The route name without the send stream.
   */
  removeSendStreamFromPath(routeName: string): string {
    return routeName.endsWith(constants.AGRUME_SEND_STREAM_PATH)
      ? routeName.slice(0, -constants.AGRUME_SEND_STREAM_PATH.length)
      : routeName
  }

  /**
   * Run the middleware for the request.
   * @returns {Promise<void>} The promise.
   */
  async run(): Promise<void> {
    const route = await this.matchRoute()
    if (route === undefined) {
      return
    }

    const parameters
      = (await this.getRequestBodyAsyncGenerator())?.()
      || await this.getRequestBodyJson()

    try {
      const result = await route(parameters as never)

      if (isGenerator<JsonValue, JsonValue | void, undefined>(result)) {
        this.handleGeneratorResponse(result)
      }
      else {
        this.handleJsonValueResponse(result)
      }
    }
    catch (error) {
      this.middleware.logger?.error?.(error)

      if (HttpErrors.isHttpError(error)) {
        return this.throwStatus(error.statusCode, error.message, true)
      }

      return this.throwStatus(500, undefined, true)
    }
  }

  /**
   * Throw a status code.
   * @param {number} status The status code.
   * @param {string} message The message.
   * @param {boolean} forceThrow If true, the next middleware will not be called.
   */
  throwStatus(
    status: number,
    message?: string,
    forceThrow: boolean = false,
  ) {
    if (forceThrow || this.next === undefined || status.toString().startsWith('5')) {
      this.response.writeHead(status, message)
      this.response.end()
      return
    }

    this.next()
  }
}

export interface MiddlewareRequest {
  body: {
    stream: Readable
  }
  headers: Record<string, string | string[]>
  method: string
  url: string
}

export interface MiddlewareResponse {
  end(data?: string): void
  flushHeaders(): void
  setHeader(name: string, value: string): void
  write(data: string): void
  writeHead(status: number, message?: string): void
}

// eslint-disable-next-line ts/no-explicit-any
function isGenerator<T = unknown, R = any, N = unknown>(value: any): value is (
  | AsyncGenerator<T, R, N>
  | Generator<T, R, N>
) {
  if (value === undefined || value === null) {
    return false
  }

  const generatorConstructor
    = function* () { yield undefined }.constructor
  const asyncGeneratorConstructor
    = async function* () { yield undefined }.constructor

  return (
    value.constructor.constructor === generatorConstructor
    || value.constructor.constructor === asyncGeneratorConstructor
  )
}
