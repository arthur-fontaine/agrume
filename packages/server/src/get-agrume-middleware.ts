import process from 'node:process'
import path from 'node:path'
import * as vite from 'vite'
import agrumeVitePlugin from '@agrume/plugin/vite'
import type Connect from 'connect'

/**
 * Get the Agrume middleware.
 * @param {object} [options] The options.
 * @param {string} options.entry The entry file.
 * @param {boolean} [options.allowUnsafe] Whether to allow loading routes from node_modules.
 * @returns {Promise<Connect.NextHandleFunction>} The Agrume middleware.
 * @internal
 */
export function getAgrumeMiddleware(
  {
    allowUnsafe = false,
    entry,
  }: { allowUnsafe?: boolean, entry: string },
) {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise<Connect.NextHandleFunction>(async (resolve) => {
    await vite.build({
      build: {
        lib: {
          entry,
          formats: ['es'],
        },
        rollupOptions: {
          external(source) {
            if (allowUnsafe) {
              return false
            }

            return path.relative(process.cwd(), source).startsWith('node_modules')
          },
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
