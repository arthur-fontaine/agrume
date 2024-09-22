import process from 'node:process'
import path from 'node:path'
import * as vite from 'vite'
import agrumeVitePlugin from '@agrume/plugin/vite'
import type Connect from 'connect'
import type { CliOptions } from '@agrume/types'

/**
 * Get the Agrume middleware.
 * @param {object} [options] The options.
 * @param {string} options.entry The entry file.
 * @param {boolean} [options.allowUnsafe] Whether to allow loading routes from node_modules.
 * @param {CliOptions} [options.config] The configuration object.
 * @returns {Promise<Connect.NextHandleFunction>} The Agrume middleware.
 * @internal
 */
export function getAgrumeMiddleware(
  {
    allowUnsafe = false,
    config,
    entry,
  }: {
    allowUnsafe?: boolean | undefined
    config?: CliOptions | undefined
    entry: string
  },
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

            return `/${path.relative(process.cwd(), source)}`.includes('/node_modules/')
          },
        },
        write: false,
      },
      logLevel: 'silent',
      plugins: [
        agrumeVitePlugin({
          baseUrl: config?.externalUrl as never,
          tunnel: config?.tunnel,
          useMiddleware: resolve,
        }),
      ],
    })
  })
}
