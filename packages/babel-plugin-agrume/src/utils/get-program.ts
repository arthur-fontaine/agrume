import { type NodePath, types as babelTypes } from '@babel/core'

/**
 * @param path The path of a node.
 * @returns The program path.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function getProgram(path: NodePath<babelTypes.Node>): (
  NodePath<babelTypes.Program> | undefined
 ) {
  const program_path = path.getAncestry().at(-1)

  if (program_path === undefined) {
    return undefined
  }

  if (!program_path.isProgram()) {
    return undefined
  }

  return program_path
}
