import fs from 'node:fs/promises'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'

import {
  _startRouteRegistration, _stopRouteRegistration, _createHttpServerHandler,
} from "@agrume/core"
import { PluginOption } from "vite"

import { transformTsx } from './transformers/transform-tsx'
import package_json from "../package.json"

/**
 * @returns The Agrume plugin.
 */
export function agrumePlugin(): PluginOption {
  return {
    name: package_json.name,

    enforce: "post",

    apply: "serve",

    async load(id) {
      const file_contents = await fs.readFile(id, "utf8")

      const transformFunction = findTransformFunction(id)

      if (transformFunction === undefined) {
        return null
      }

      const transformed_file_contents = (
        await transformFunction(file_contents)
      )

      if (transformed_file_contents === null) {
        return null
      }

      void _startRouteRegistration()

      try {
        void runInNewContext(transformed_file_contents, {
          require: function (module_name: string) {
            if (module_name.startsWith('.')) {
              return {}
            }
            return createRequire(import.meta.url)(module_name)
          },
          module: {},
        })
      } catch (error) {
        // console.error(error)
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

const transform_functions = {
  ".js": function (code: string) {
    return Promise.resolve(code)
  },
  ".tsx": transformTsx,
}

function findTransformFunction(id: string) {
  // eslint-disable-next-line functional/no-loop-statements
  for (
    const [extension, transformFunction] of Object.entries(transform_functions)
  ) {
    if (id.endsWith(extension)) {
      return transformFunction
    }
  }

  return undefined
}
