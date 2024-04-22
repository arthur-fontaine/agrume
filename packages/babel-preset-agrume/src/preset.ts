import type { TransformOptions } from '@babel/core'
import babelPluginFlowStrip from '@babel/plugin-transform-flow-strip-types'
import babelPluginSyntaxHermesParser from 'babel-plugin-syntax-hermes-parser'
import babelPluginSyntaxJsx from '@babel/plugin-syntax-jsx'
import babelPluginTransformTypescript from '@babel/plugin-transform-typescript'
import { agrumePlugin as agrumeBabelPlugin } from 'babel-plugin-agrume'

/**
 * A Babel preset to use Agrume.
 * @returns {TransformOptions} The Babel preset.
 */
// eslint-disable-next-line import/no-default-export
export default function preset(): TransformOptions {
  return {
    plugins: [
      babelPluginSyntaxHermesParser,
      babelPluginFlowStrip,
      babelPluginSyntaxJsx,
      [babelPluginTransformTypescript, {
        allExtensions: true,
        isTSX: true,
      }],
      agrumeBabelPlugin,
    ],
  }
}
