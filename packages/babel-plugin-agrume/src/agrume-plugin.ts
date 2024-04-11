import type { PluginObj } from '@babel/core'

import { state } from '@agrume/internals'
import packageJson from '../package.json'
import { transformCallExpression } from './transforms/transform-call-expression'

/**
 * The Agrume Babel plugin.
 * @returns {PluginObj} The Babel plugin.
 */
export function agrumePlugin(): PluginObj {
  return {
    name: packageJson.name,
    visitor: {
      CallExpression: transformCallExpression,
      Program: {
        enter() {
          state.set((state) => {
            state.isRegistering = true
            return state
          })
        },
        exit() {
          state.set((state) => {
            state.isRegistering = false
            return state
          })
        },
      },
    },
  }
}
