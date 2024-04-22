import * as vite from 'vite'
import agrumeVitePlugin from '@agrume/plugin/vite'
import type Connect from 'connect'

/**
 * Get the Agrume middleware.
 * @param {object} [options] The options.
 * @param {string} options.entry The entry file.
 * @returns {Promise<Connect.NextHandleFunction>} The Agrume middleware.
 * @internal
 */
export function getAgrumeMiddleware({ entry }: { entry: string }) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<Connect.NextHandleFunction>(async (resolve) => {
    await vite.build({
      build: {
        lib: {
          entry,
          formats: ['es'],
        },
        write: false,
      },
      logLevel: 'silent',
      plugins: [
        agrumeVitePlugin({
          useMiddleware: resolve,
        }),
      ],
    })
  })
}
