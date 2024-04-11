import type { NodePath, types as babelTypes } from '@babel/core'

/**
 * Get the program path from a node path.
 * @param {NodePath<babelTypes.Node>} path The path of a node.
 * @returns {NodePath<babelTypes.Program> | undefined} The program path.
 */
export function getProgram(
  path: NodePath<babelTypes.Node>,
): NodePath<babelTypes.Program> | undefined {
  const programPath = path.getAncestry().at(-1)

  if (programPath === undefined) {
    return
  }

  if (!programPath.isProgram()) {
    return
  }

  return programPath
}
