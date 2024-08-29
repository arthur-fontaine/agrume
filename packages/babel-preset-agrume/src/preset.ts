import type { GlobalOptions } from '@agrume/types'
import type { TransformOptions } from '@babel/core'
import { declare } from '@babel/helper-plugin-utils'
import babelPluginFlowStrip from '@babel/plugin-transform-flow-strip-types'
import babelPluginSyntaxHermesParser from 'babel-plugin-syntax-hermes-parser'
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import babelPluginTransformReactJsx from '@babel/plugin-transform-react-jsx'
import babelPluginTransformTypescript from '@babel/plugin-transform-typescript'
import { agrumePlugin as agrumeBabelPlugin } from 'babel-plugin-agrume'

/**
 * A Babel preset to use Agrume.
 * @param {GlobalOptions} [options] The options.
 * @returns {TransformOptions} The Babel preset.
 */
// @ts-expect-error `declare` is normally used for plugins, so it doesn't accept `TransformOptions`
// for plugin return type. But it is ok.
// eslint-disable-next-line import/no-default-export
export default declare<GlobalOptions, TransformOptions>((api, options) => {
  return {
    compact: false,
    plugins: [
      babelPluginSyntaxHermesParser,
      babelPluginFlowStrip,
      babelPluginSyntaxJsx,
      [babelPluginTransformReactJsx, {
        runtime: 'automatic',
      }],
      [babelPluginTransformTypescript, {
        allExtensions: true,
        isTSX: true,
      }],
      [agrumeBabelPlugin, options],
    ],
  }
})
