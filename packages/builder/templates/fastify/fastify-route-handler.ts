import { Transform } from 'node:stream'
import type { TransformStream } from 'node:stream/web'
import type * as Fastify from 'fastify'
import type { AnyRoute } from '@agrume/types'
import { RouteHandler } from './route-handler'

const bodyStreams = new Map<string, TransformStream<Uint8Array>>()

async function getRouteStream(
  requestKey: string,
): Promise<TransformStream<Uint8Array>> {
  const routeStream
    = bodyStreams.get(requestKey) ?? Transform.toWeb(new Transform({
      transform(chunk, _encoding, callback) {
        this.push(chunk)
        callback()
      },
    }))
  bodyStreams.set(requestKey, routeStream)
  return routeStream
}

/**
 * The Fastify route handler.
 */
export class FastifyRouteHandler extends RouteHandler {
  /**
   * Create a new Fastify route handler.
   * @param {AnyRoute} route The route.
   * @param {Fastify.FastifyRequest} request The request.
   * @param {Fastify.FastifyReply} reply The reply.
   */
  constructor(
    private route: AnyRoute,
    request: Fastify.FastifyRequest,
    reply: Fastify.FastifyReply,
  ) {
    const headers: Record<string, string | string[]> = {}
    for (const [key, value] of Object.entries(request.headers)) {
      if (value !== undefined) {
        headers[key] = value
      }
    }

    super(
      { getRouteStream },
      {
        body: { stream: request.raw },
        headers,
        method: request.method,
        url: request.url,
      },
      {
        end(data) { reply.send(data) },
        flushHeaders() { reply.raw.flushHeaders() },
        setHeader(name, value) { reply.header(name, value) },
        write(data) { reply.send(data) },
        writeHead(status, message) {
          if (message !== undefined) {
            reply.status(status).send(message)
            return
          }
          reply.status(status)
        },
      },
    )
  }

  /**
   * Find the route that matches the request.
   * @returns {Promise<AnyRoute | undefined>} The route.
   */
  override async matchRoute(): Promise<AnyRoute | undefined> {
    return this.route
  }
}
