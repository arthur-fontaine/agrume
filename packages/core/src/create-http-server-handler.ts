/// <reference types="@types/node" />

import type { IncomingMessage, ServerResponse } from "node:http"

import { _getRoutes } from "./route-registration"

/**
 * @returns The HTTP server.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function _createHttpServerHandler() {
  const routes = _getRoutes()

  /* eslint-disable functional/no-expression-statements */
  /* eslint-disable functional/no-return-void */
  // eslint-disable-next-line functional/prefer-immutable-types
  const server = function (request: IncomingMessage, response: ServerResponse) {
    if (request.method !== "POST") {
      response.writeHead(405)
      response.end()
      return
    }

    const route_name = request.url?.replace("/api/", "")

    if (route_name === undefined) {
      response.writeHead(404)
      response.end()
      return
    }

    const route = routes.get(route_name)

    if (route === undefined) {
      response.writeHead(404)
      response.end()
      return
    }

    const chunks: Uint8Array[] = []
    request.on("data", function (chunk) {
      // eslint-disable-next-line functional/immutable-data
      chunks.push(chunk)
    })

    request.on("end", function () {
      const body = Buffer.concat(chunks)

      const parameters = JSON.parse(body.toString())

      const result = route(parameters)

      response.writeHead(200, {
        "Content-Type": "application/json",
      })

      response.end(JSON.stringify(result))
    })
  }

  return server
}
