import { state } from '@agrume/internals'
import { createHttpServerHandler } from '@agrume/core'

import type { PluginOptions } from '@agrume/types'

/**
 * Create the build end function.
 * @param {PluginOptions} pluginOptions The plugin options.
 * @returns {Function} The build end function.
 */
export function createBuildEnd(pluginOptions: PluginOptions) {
  return function buildEnd() {
    state.set((state) => {
      state.isRegistering = false
      return state
    })

    if (pluginOptions.useMiddleware) {
      pluginOptions.useMiddleware(createHttpServerHandler())
    }
  }
}
