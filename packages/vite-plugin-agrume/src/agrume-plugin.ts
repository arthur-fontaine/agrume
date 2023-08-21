import {
  _startRouteRegistration, _stopRouteRegistration, _createConnectMiddleware,
  AgrumeOptions, setOptions, getOptions,
} from "@agrume/core"
import babel from '@babel/core'
// eslint-disable-next-line lines-around-comment
// @ts-expect-error No types available for this package.
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
// eslint-disable-next-line lines-around-comment
// @ts-expect-error No types available for this package.
import babelPluginTransformTypescript from '@babel/plugin-transform-typescript'
import { agrume as agrumeBabelPlugin } from 'babel-plugin-agrume'
import { PluginOption } from "vite"

import package_json from "../package.json"

type AgrumePluginOptions = AgrumeOptions

/**
 * @param options The Agrume plugin options.
 * @returns The Agrume plugin.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function agrumePlugin(options: AgrumePluginOptions = {}): PluginOption {
  void setOptions(options)

  return {
    name: package_json.name,

    enforce: "pre",

    apply: "serve",

    async transform(code, id) {
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
      const server = getOptions().server ?? server_by_vite.middlewares

      void server.use(agrumeServerHandler)

      return undefined
    },
  }
}
