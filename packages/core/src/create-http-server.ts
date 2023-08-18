/// <reference types="@types/node" />

import { createServer } from "node:http"

import { Route } from "./types/route"

/**
 * @param routes The routes to create the HTTP server for.
 * @returns The HTTP server.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function _createHttpServer(routes: Map<string, Route>) {
  /* eslint-disable functional/no-expression-statements */
  /* eslint-disable functional/no-return-void */
  const server = createServer(function (request, response) {
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
  })

  return server
}
