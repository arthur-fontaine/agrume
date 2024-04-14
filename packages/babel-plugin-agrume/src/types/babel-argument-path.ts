import type { NodePath, types as babelTypes } from '@babel/core'

export type BabelArgumentPath
  = NodePath<babelTypes.CallExpression['arguments'][number]>
