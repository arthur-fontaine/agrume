import { Readable, Transform } from 'node:stream'
import type { TransformStream } from 'node:stream/web'
import { state } from '@agrume/internals'
import { options } from '../client/options'
import { type MiddlewareRequest, type MiddlewareResponse, RouteHandler } from './route-handler'
import { constants } from './constants'

/**
 *
 */
export class Middleware {
  bodyStreams = new Map<string, TransformStream<Uint8Array>>()

  logger = options.get().logger

  /**
   * Create a stream if it doesn't exist and return it.
   * @param {string} requestKey The request key.
   * @returns {TransformStream<Uint8Array>} The stream.
   */
  async getRouteStream(
    requestKey: string,
  ): Promise<TransformStream<Uint8Array>> {
    const routeStream = this.bodyStreams.get(requestKey) ?? createEmptyStream()
    this.bodyStreams.set(requestKey, routeStream)
    return routeStream
  }

  /**
   * Run the middleware for the request.
   * @param {MiddlewareRequest} request The request.
   * @param {MiddlewareResponse} response The response.
   * @param {() => void} next The next middleware.
   */
  async runMiddleware(
    request: MiddlewareRequest,
    response: MiddlewareResponse,
    next?: () => void,
  ) {
    await this.waitServerUnpause()
    this.logger?.info?.(request.method, request.url)

    const routeHandler
      = new RouteHandler(this, request, response, next)

    await this.runSendStreamMiddleware(routeHandler)
    || await routeHandler.run()
  }

  /**
   * Run the send stream middleware.
   * @param {RouteHandler} ctx The middleware context.
   * @returns {Promise<boolean>} Whether the send stream middleware was run.
   */
  async runSendStreamMiddleware(ctx: RouteHandler): Promise<boolean> {
    const requestKey = ctx.getRequestKey()
    const routeName = ctx.getRouteName()

    if (
      requestKey === undefined
      || !routeName.endsWith(constants.AGRUME_SEND_STREAM_PATH)
    ) {
      return false
    }

    const routeStream = await this.getRouteStream(requestKey)
    this.bodyStreams.set(requestKey, routeStream)

    Readable.toWeb(ctx.request.body.stream).pipeTo(routeStream.writable)

    return true
  }

  /**
   * Wait for the server to unpause.
   */
  async waitServerUnpause() {
    return new Promise<void>((resolve) => {
      const CHECK_INTERVAL = 50
      let interval: NodeJS.Timer

      const resolveIfNotPaused = () => {
        if (state.get().isServerPaused === false) {
          resolve()
          clearInterval(interval)
        }
      }

      interval = setInterval(() => resolveIfNotPaused(), CHECK_INTERVAL)
      resolveIfNotPaused()
    })
  }
}

function createEmptyStream() {
  return Transform.toWeb(new Transform({
    transform(chunk, _encoding, callback) {
      this.push(chunk)
      callback()
    },
  }))
}
