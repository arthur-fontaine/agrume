/* eslint-disable functional/prefer-immutable-types */

import { type NodePath, types as babelTypes } from '@babel/core'

/**
 * @param path1 The path of a node.
 * @param path2 The path of a node.
 * @returns Whether the two paths are the same.
 */
export function areSameNodePath(
  path1: NodePath<babelTypes.Node>,
  path2: NodePath<babelTypes.Node>,
) {
  const ancestor_path1 = path1.getAncestry()
  const ancestor_path2 = path2.getAncestry()

  function getAncestorTypes(ancestor_path: NodePath[]) {
    return ancestor_path.map(function (path) {
      return path.node.type
    })
  }
  const ancestor_types1 = getAncestorTypes(ancestor_path1)
  const ancestor_types2 = getAncestorTypes(ancestor_path2)

  return JSON.stringify(ancestor_types1) === JSON.stringify(ancestor_types2)
}
