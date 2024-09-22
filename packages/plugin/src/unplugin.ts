import type { UnpluginFactory, UnpluginOptions } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { PluginOptions } from '@agrume/types'

import packageJson from '../package.json'
import { createTransform } from './utils/create-transform'
import { createConfigureServer } from './utils/vite/create-configure-server'
import { createBuildEnd } from './utils/vite/create-build-end'

/**
 * The Agrume Vite plugin factory.
 * @param {PluginOptions} pluginOptions The options.
 * @returns {ReturnType<UnpluginFactory<PluginOptions>>} The plugin.
 */
export const unpluginFactory: UnpluginFactory<PluginOptions | undefined>
  = (pluginOptions = {}) => {
    const basePlugin: UnpluginOptions = {
      buildEnd: createBuildEnd(pluginOptions),
      buildStart() {
        if (pluginOptions.useMiddleware === undefined) {
          console.warn(
            'The "useMiddleware" option is not set. To access the Agrume routes, you either need to target the "serve" environment or set the "useMiddleware" option to get and use the middleware on your own.',
          )
        }
      },
      enforce: 'pre',
      name: packageJson.name,
      transform: createTransform(pluginOptions),
    }

    return [
      {
        ...basePlugin,
        vite: {
          apply: 'build',
        },
      },
      {
        ...basePlugin,
        vite: {
          apply: 'serve',
          buildEnd: undefined as never,
          buildStart: undefined as never,
          configureServer: createConfigureServer(pluginOptions),
        },
      },
    ]
  }

export const unplugin = /* #__PURE__ */ createUnplugin(unpluginFactory)

// eslint-disable-next-line import/no-default-export
export default unplugin
