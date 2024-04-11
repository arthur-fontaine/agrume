import type { NodePath, types as babelTypes } from '@babel/core'

/**
 * Check whether two paths are the same node.
 * @param {NodePath<babelTypes.Node>} path1 The path of a node.
 * @param {NodePath<babelTypes.Node>} path2 The path of a node.
 * @returns {boolean} Whether the two paths are the same.
 */
export function areSameNodePath(
  path1: NodePath<babelTypes.Node>,
  path2: NodePath<babelTypes.Node>,
) {
  const ancestorsPath1 = path1.getAncestry()
  const ancestorsPath2 = path2.getAncestry()

  function getAncestorTypes(ancestor_path: NodePath[]) {
    return ancestor_path.flatMap((path) => {
      if (path.isProgram() || path.isExportDeclaration()) {
        return []
      }

      return path.node.type
    })
  }
  const ancestorTypes1 = getAncestorTypes(ancestorsPath1)
  const ancestorTypes2 = getAncestorTypes(ancestorsPath2)

  return JSON.stringify(ancestorTypes1) === JSON.stringify(ancestorTypes2)
}
