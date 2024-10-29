/* eslint-disable filename-export/match-named-export */

import type Connect from 'connect'
import { ConnectMiddleware } from './server/connect-middleware'

export { createRoute } from './client/create-route'

export { ConnectMiddleware } from './server/connect-middleware'
export { Middleware } from './server/middleware'
export { RouteHandler } from './server/route-handler'
export type { MiddlewareRequest, MiddlewareResponse } from './server/route-handler'

/**
 * Create a Connect-compatible HTTP server handler with the routes.
 * @returns {Connect.NextHandleFunction} The HTTP server handler.
 */
export function createHttpServerHandler(): Connect.NextHandleFunction {
  const connectMiddleware = new ConnectMiddleware()
  return connectMiddleware.asConnectMiddleware()
}
