/// <reference types="@types/node" />

import type Connect from "connect"
import { JsonValue } from "type-fest"

import { getOptions } from "./options"
import { _getRoutes } from "./route-registration"

/**
 * @returns The HTTP server.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function _createConnectMiddleware() {
  const routes = _getRoutes()

  /* eslint-disable functional/no-expression-statements */
  /* eslint-disable functional/no-return-void */
  const middleware: Connect.NextHandleFunction = (
    function (request, response, next?) {
      const throwStatus = function (status: number) {
        if (next === undefined || status.toString().startsWith("5")) {
          response.writeHead(status)
          response.end()
          return
        }

        next()
      }

      if (request.method !== "POST") {
        throwStatus(405)
        return
      }

      const prefix = getOptions().prefix
      const route_name = request.url?.replace(new RegExp(`^${prefix}`), "")

      if (route_name === undefined) {
        throwStatus(404)
        return
      }

      const route = routes.get(route_name)

      if (route === undefined) {
        throwStatus(404)
        return
      }

      const chunks: Uint8Array[] = []
      request.on("data", function (chunk) {
        // eslint-disable-next-line functional/immutable-data
        chunks.push(chunk)
      })

      request.on("end", async function () {
        const body = Buffer.concat(chunks)
        const stringfied_body = body.toString()

        // eslint-disable-next-line functional/no-let
        let parameters: JsonValue
        try {
          parameters = stringfied_body === ''
            ? {}
            : JSON.parse(stringfied_body)
        } catch (error) {
          throwStatus(400)
          return
        }

        // eslint-disable-next-line functional/no-let
        let result: JsonValue
        try {
          result = await route(parameters, globalThis)
        } catch (error) {
          throwStatus(500)
          return
        }

        response.writeHead(200, {
          "Content-Type": "application/json",
        })

        response.end(JSON.stringify(result))
      })
    }
  )

  return middleware
}
