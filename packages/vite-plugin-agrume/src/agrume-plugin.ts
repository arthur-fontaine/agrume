import {
  _startRouteRegistration, _stopRouteRegistration, _createConnectMiddleware,
  AgrumeOptions, setAgrumeOptions,
} from "@agrume/core"
import babel from '@babel/core'
// eslint-disable-next-line lines-around-comment
// @ts-expect-error No types available for this package.
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
// eslint-disable-next-line lines-around-comment
// @ts-expect-error No types available for this package.
import babelPluginTransformTypescript from '@babel/plugin-transform-typescript'
import { agrume as agrumeBabelPlugin } from 'babel-plugin-agrume'
import type * as Connect from "connect"
import { PluginOption } from "vite"

import package_json from "../package.json"

interface AgrumePluginOptions extends AgrumeOptions {
  // eslint-disable-next-line functional/no-return-void
  useMiddleware?: (middleware: Connect.NextHandleFunction) => void
}

/**
 * @param options The Agrume plugin options.
 * @returns The Agrume plugin.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function agrumePlugin(options: AgrumePluginOptions = {}): PluginOption {
  void setAgrumeOptions(options)

  return {
    name: package_json.name,

    enforce: "pre",

    apply: "serve",

    async transform(code, id) {
      const extensions = ['.ts', '.tsx', '.js', '.jsx']

      if (!extensions.some(function (extension) {
        return id.endsWith(extension)
      })) {
        return null
      }

      void _startRouteRegistration()

      try {
        const result = babel.transformSync(code, {
          filename: id,
          plugins: [
            babelPluginSyntaxJsx,
            [babelPluginTransformTypescript, {
              isTSX: true,
              allExtensions: true,
            }],
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

    configureServer(server_by_vite) {
      void _stopRouteRegistration()
      const agrumeServerHandler = _createConnectMiddleware()

      const useMiddleware = (
        options.useMiddleware ??
        server_by_vite.middlewares.use.bind(server_by_vite.middlewares)
      )

      void useMiddleware(agrumeServerHandler)

      return undefined
    },
  }
}
