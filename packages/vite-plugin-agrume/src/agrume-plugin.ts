import {
  _startRouteRegistration, _stopRouteRegistration, _createHttpServerHandler,
} from "@agrume/core"
import babel from '@babel/core'
import { agrume as agrumeBabelPlugin } from 'babel-plugin-agrume'
import { PluginOption } from "vite"

import package_json from "../package.json"

/**
 * @returns The Agrume plugin.
 */
export function agrumePlugin(): PluginOption {
  return {
    name: package_json.name,

    enforce: "post",

    apply: "serve",

    async transform(code, id) {
      void _startRouteRegistration()

      try {
        const result = babel.transformSync(code, {
          filename: id,
          plugins: [
            agrumeBabelPlugin,
          ],
        })

        const transformed_code = result?.code

        return transformed_code === null || transformed_code === undefined
          ? null
          : {
            code: transformed_code,
            map: result?.map as any,
          }
      } catch (error) {
        console.error(error)
      }

      return null
    },

    // eslint-disable-next-line functional/no-return-void
    configureServer(server) {
      void _stopRouteRegistration()
      const agrumeServerHandler = _createHttpServerHandler()

      // eslint-disable-next-line functional/no-return-void
      void server.middlewares.use(function (request, response, next) {
        void agrumeServerHandler(request, response, next)
      })
    },
  }
}
