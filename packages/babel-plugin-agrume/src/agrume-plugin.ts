import { _startRouteRegistration, _stopRouteRegistration } from "@agrume/core"
import type { PluginObj } from "@babel/core"

import { transformCallExpression } from "./transforms/call-expression"
import package_json from "../package.json"

/**
 * @returns The Agrume plugin.
 */
export function agrumePlugin(): PluginObj {
  return {
    name: package_json.name,

    visitor: {
      Program: {
        enter() {
          void _startRouteRegistration()
          return undefined
        },
        exit() {
          void _stopRouteRegistration()
          return undefined
        },
      },
      CallExpression: transformCallExpression,
    },
  }
}
