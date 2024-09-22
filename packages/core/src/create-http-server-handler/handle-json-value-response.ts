import type * as http from 'node:http'
import type { RouteReturnValue } from '@agrume/types'

/**
 * Send the response to the client based on the generator's next value.
 * @param {http.ServerResponse} response The response object.
 * @param {object} jsonValue The JSON value.
 */
export function handleJsonValueResponse(
  response: http.ServerResponse,
  jsonValue: Awaited<Extract<RouteReturnValue, Promise<unknown>>>,
): void {
  response.setHeader('Content-Type', 'application/json')

  if (jsonValue === undefined || jsonValue === null) {
    response.writeHead(204)
    response.end()
    return
  }

  response.writeHead(200)
  response.end(JSON.stringify(jsonValue))
}
