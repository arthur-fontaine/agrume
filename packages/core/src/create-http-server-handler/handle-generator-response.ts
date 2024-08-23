import type * as http from 'node:http'
import type { JsonValue } from 'type-fest'

/**
 * Send the response to the client based on the generator's next value.
 * @param {http.ServerResponse} response The response object.
 * @param {Generator} generator The generator.
 */
export async function handleGeneratorResponse(
  response: http.ServerResponse,
  generator:
    | AsyncGenerator<JsonValue, JsonValue | void, undefined>
    | Generator<JsonValue, JsonValue | void, undefined>,
): Promise<void> {
  response.setHeader('Cache-Control', 'no-cache')
  response.setHeader('Content-Type', 'text/event-stream')
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Connection', 'keep-alive')
  response.flushHeaders() // flush the headers to establish SSE with client

  while (true) {
    const { done, value } = await generator.next()

    if (done) {
      response.write('DONE\n\n')
      response.end()
      return
    }

    response.write(`data: ${JSON.stringify(value)}\n\n`)
  }
}
