import { state } from '@agrume/internals'
import { createHttpServerHandler } from '@agrume/core'
import type { ViteDevServer } from 'vite'

import type { PluginOptions } from '@agrume/types'

/**
 * Create the configure server function.
 * @param {PluginOptions} pluginOptions The plugin options.
 * @returns {Function} The configure server function.
 */
export function createConfigureServer(pluginOptions: PluginOptions) {
  return function createServer(serverByVite: ViteDevServer) {
    state.set((state) => {
      state.isRegistering = false
      return state
    })

    const useMiddleware = (
      pluginOptions.useMiddleware
      ?? serverByVite.middlewares.use.bind(serverByVite.middlewares)
    )

    useMiddleware(createHttpServerHandler())
  }
}
