import * as vite from 'vite'
import agrumeVitePlugin from '@agrume/plugin/vite'
import type Connect from 'connect'

/**
 * Get the Agrume middleware.
 * @param {object} [options] The options.
 * @param {vite.InlineConfig} [options.viteConfig] The Vite config.
 * @returns {Promise<Connect.NextHandleFunction>} The Agrume middleware.
 * @internal
 */
export function getAgrumeMiddleware({
  viteConfig,
}: { viteConfig?: vite.InlineConfig } = {}) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<Connect.NextHandleFunction>(async (resolve) => {
    await vite.build(vite.mergeConfig(viteConfig ?? {}, {
      logLevel: 'silent',
      plugins: [
        agrumeVitePlugin({
          useMiddleware: resolve,
        }),
      ],
    }))
  })
}
