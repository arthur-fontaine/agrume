import type Connect from 'connect'
import type { MiddlewareRequest } from './middleware-context'
import { Middleware } from './middleware'

/**
 * The Connect middleware.
 */
export class ConnectMiddleware extends Middleware {
  /**
   * Create a new Connect middleware.
   * @returns {Connect.NextHandleFunction} The Connect middleware.
   */
  asConnectMiddleware(): Connect.NextHandleFunction {
    return (req, res, next) => this.runMiddleware(
      this.getMiddlewareRequest(req),
      res,
      next,
    )
  }

  /**
   * Get a MiddlewareRequest from a Connect request.
   * @param {Connect.IncomingMessage} req The Connect request.
   * @returns {MiddlewareRequest} The MiddlewareRequest.
   */
  getMiddlewareRequest(req: Connect.IncomingMessage): MiddlewareRequest {
    const method = req.method
    const url = req.url
    const headers: Record<string, string | string[]> = {}
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) {
        headers[key] = value
      }
    }

    if (method === undefined || url === undefined) {
      // eslint-disable-next-line fp/no-throw
      throw new Error('Method and URL are required.')
    }

    return {
      body: {
        stream: req,
      },
      headers,
      method,
      url,
    }
  }
}
