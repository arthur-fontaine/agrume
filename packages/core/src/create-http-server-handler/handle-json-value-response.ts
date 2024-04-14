import type * as http from 'node:http'
import type { JsonValue } from 'type-fest'

/**
 * Send the response to the client based on the generator's next value.
 * @param {http.ServerResponse} response The response object.
 * @param {JsonValue} jsonValue The JSON value.
 */
export function handleJsonValueResponse(
  response: http.ServerResponse,
  jsonValue: JsonValue,
): void {
  response.setHeader('Content-Type', 'application/json')
  response.writeHead(200)
  response.end(JSON.stringify(jsonValue))
}
