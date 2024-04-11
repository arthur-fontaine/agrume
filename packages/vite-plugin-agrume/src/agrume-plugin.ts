import { createHttpServerHandler } from '@agrume/core'
import { state } from '@agrume/internals'

import babel from '@babel/core'
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import babelPluginTransformTypescript from '@babel/plugin-transform-typescript'
import { agrumePlugin as agrumeBabelPlugin } from 'babel-plugin-agrume'
import type { ViteDevServer, PluginOption as VitePluginOption } from 'vite'

import packageJson from '../package.json'
import type { PluginOptions } from './types/plugin-options'

/**
 * The Agrume Vite plugin.
 * @param {PluginOptions} [pluginOptions] The options.
 * @returns {VitePluginOption} The Vite plugin.
 */
export function agrumePlugin(
  pluginOptions: PluginOptions = {},
): VitePluginOption {
  state.set((state) => {
    state.options = pluginOptions
    return state
  })

  return {
    apply: 'serve',
    configureServer: createConfigureServer(pluginOptions),
    enforce: 'pre',
    name: packageJson.name,
    transform,
  }
}

function createConfigureServer(pluginOptions: PluginOptions) {
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

async function transform(code: string, id: string) {
  state.set((state) => {
    state.isRegistering = true
    return state
  })

  const extensions = ['.ts', '.tsx', '.js', '.jsx']

  if (!extensions.some(extension => id.endsWith(extension))) {
    return null
  }

  try {
    const result = babel.transformSync(code, {
      filename: id,
      plugins: [
        babelPluginSyntaxJsx,
        [babelPluginTransformTypescript, {
          allExtensions: true,
          isTSX: true,
        }],
        agrumeBabelPlugin,
      ],
    })

    const transformedCode = result?.code ?? null

    return transformedCode === null
      ? null
      : {
        code: transformedCode,
        // eslint-disable-next-line ts/no-explicit-any
        map: result?.map as any,
      }
  }
  catch (error) {
    console.error(error)
  }

  return null
}
