import _babel from '@babel/core'
import agrumePreset from 'babel-preset-agrume'
import type { PluginOptions } from '@agrume/types'

const babel = ('default' in _babel ? _babel.default : _babel) as typeof _babel

/**
 * Transform the code.
 * @param {PluginOptions} [options] The options.
 * @returns {Promise<null | { code: string, map: unknown }>} The transformed code.
 */
export function createTransform(options?: PluginOptions) {
  return async function transform(code: string, id: string) {
    const extensions = ['.ts', '.tsx', '.js', '.jsx']

    if (!extensions.some(extension => id.endsWith(extension))) {
      return null
    }

    try {
      const result = babel.transformSync(code, {
        babelrc: false,
        configFile: false,
        filename: id,
        presets: [[agrumePreset, options]],
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
}
