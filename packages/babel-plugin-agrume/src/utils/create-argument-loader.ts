/* eslint-disable fp/no-throw */

import path from 'node:path'

import type { NodePath } from '@babel/core'
import babel, { types as babelTypes } from '@babel/core'
import generate from '@babel/generator'
import agrumePackageJson from 'agrume/package.json'

import esbuild from 'esbuild'

import type { BabelArgumentPath } from '../types/babel-argument-path'
import treeShakePlugin from './tree-shake.babel'

import { areSameNodePath } from './are-same-node-path'
import { getProgram } from './get-program'

/**
 * Create a new stringified function that removes all external variables from the given object.
 * @param {NodePath<babelTypes.CallExpression['arguments'][number]>} argument The argument.
 * @param {string} filePath The file path.
 * @returns {Error | string | undefined} An error if any. Otherwise, a loader function for the argument.
 */
export function createArgumentLoader(
  argument: BabelArgumentPath,
  filePath: string,
): Error | string | undefined {
  const program = getProgram(argument)

  if (program === undefined) {
    return new Error('Could not find program.')
  }

  try {
    const fileContents = generate(program.node).code

    const bundledFileContents = getBundledFileContents(fileContents, filePath)

    const functionSource = getArgumentFunctionSource(
      bundledFileContents ?? fileContents,
      filePath,
      argument,
    )

    return functionSource
  }
  catch (error) {
    console.error(error)
    return error as Error
  }
}

function getBundledFileContents(
  file_contents: string,
  file_path: string,
) {
  const bundledFileContents = (esbuild.buildSync({
    bundle: true,
    format: 'esm',
    packages: 'external',
    platform: 'node',
    stdin: {
      contents: file_contents,
      loader: 'tsx',
      resolveDir: path.dirname(file_path),
      sourcefile: file_path,
    },
    write: false,
  }).outputFiles[0]?.text)

  return bundledFileContents
}

function getArgumentFunctionSource(
  fileContents: string,
  filePath: string,
  argument: BabelArgumentPath,
) {
  let functionSource: string | undefined

  babel.transformSync(fileContents, {
    filename: filePath,
    plugins: [
      exportOnlyBabelArgumentPathPlugin(argument),
      removeUnusedVariablesPlugin(),

      // Process the file to isolate the function.
      {
        visitor: {
          Program: {
            enter(path: NodePath<babelTypes.Program>) {
              // Every statement outside of the function is moved inside the function.
              assembleBabelArgumentPath(path)

              // Because we moved the statements inside the function, we can't use imports anymore. We transform them
              // to dynamic imports.
              transformImportsToDynamicImports(path)
              removeExports(path, true)

              functionSource = generate(path.node).code

              return path.stop()
            },
          },
        },
      },
    ],
  })

  return functionSource
}

function exportOnlyBabelArgumentPathPlugin(argument: BabelArgumentPath) {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<babelTypes.Program>) {
          // We remove all exports to avoid considering them as used.
          removeExports(path)

          // We export the function to consider it as used.
          wrapAndExportBabelArgumentPath(path, argument)
        },
      },
    },
  }
}

function removeExports(path: NodePath, allowDefault = false) {
  function unwrapExport(path: NodePath<
    | babelTypes.ExportDefaultDeclaration
    | babelTypes.ExportNamedDeclaration
  >) {
    if (
      path.node.declaration === null
      || path.node.declaration === undefined
    ) {
      path.remove()
      return
    }

    path.replaceWith(path.node.declaration)
  }

  path.traverse({
    ExportDefaultDeclaration(path) {
      if (allowDefault) {
        unwrapExport(path)
        return
      }

      path.remove()
    },
    ExportNamedDeclaration(path) {
      unwrapExport(path)
    },
  })
}

function wrapAndExportBabelArgumentPath(
  programPath: NodePath<babelTypes.Program>,
  argument: BabelArgumentPath,
) {
  programPath.traverse({
    [argument.node.type](path: NodePath) {
      if (areSameNodePath(path, argument)) {
        if (
          path.isIdentifier()
          && argument.isIdentifier()
          && path.node.name !== argument.node.name
        ) {
          return
        }

        let pathToExport = path

        if (path.isIdentifier()) {
          const binding = path.scope.getBinding(path.node.name)

          if (binding === undefined) {
            throw new Error('Could not find binding.')
          }

          if (binding.path.isVariableDeclarator()) {
            const init = binding.path.get('init')

            if (init.node === undefined || init.node === null) {
              throw new Error('Could not find init.')
            }

            pathToExport = init as NodePath<NonNullable<typeof init.node>>
          }
        }

        const rootLevelPath = pathToExport.getAncestry().at(-2)

        if (rootLevelPath === undefined) {
          throw new Error('Could not find root level path.')
        }

        if (!rootLevelPath.isDeclaration()) {
          throw new Error('Root level path is not a declaration.')
        }

        if (!pathToExport.isExpression()) {
          throw new Error('Function argument needs to be an expression.')
        }

        const exportedFunction = babelTypes.exportDefaultDeclaration(
          babelTypes.functionDeclaration(null, [], babelTypes.blockStatement([
            babelTypes.returnStatement(pathToExport.node),
          ])),
        )

        rootLevelPath.replaceWith(exportedFunction)
      }
    },
  })
}

function removeUnusedVariablesPlugin() {
  return treeShakePlugin({ types: babelTypes })
}

function assembleBabelArgumentPath(path: NodePath<babelTypes.Program>) {
  const statements = path.get('body')

  const exportedBabelArgumentPath = statements.find((statement) => {
    return statement.isExportDeclaration()
  }) as NodePath<babelTypes.ExportDeclaration> | undefined

  if (exportedBabelArgumentPath === undefined) {
    throw new Error('Unable to find the exported declaration.')
  }

  const argumentFunction = exportedBabelArgumentPath.get('declaration')

  if (Array.isArray(argumentFunction)) {
    throw new TypeError('The exported declaration is an array.')
  }

  if (!argumentFunction.isFunctionDeclaration()) {
    throw new Error('The exported declaration is not a function.')
  }

  let insertedCount = 0
  statements.forEach((statement) => {
    // If the statement is the function statement, we don't move it.
    if (statement === exportedBabelArgumentPath) {
      return
    }

    // If the statement is the import of the agrume core package, we don't move it.
    if (
      statement.isImportDeclaration()
      && statement.node.source.value === agrumePackageJson.name
    ) {
      return
    }

    const blockStatements = argumentFunction.get('body')
    const blockStatement = Array.isArray(blockStatements)
      ? blockStatements[0]
      : blockStatements

    if (blockStatement === undefined || !blockStatement.isBlockStatement()) {
      return
    }

    // We move the statement inside the function.
    blockStatement.get('body')[insertedCount]?.insertBefore(statement.node)
    statement.remove()

    insertedCount += 1
  })
}

function transformImportsToDynamicImports(path: NodePath) {
  path.traverse({
    ImportDeclaration(path) {
      const dynamicImport = transformImportToDynamicImport(path)

      if (dynamicImport === undefined) {
        return
      }

      path.replaceWith(dynamicImport)
    },
  })
}

function transformImportToDynamicImport(
  path: NodePath<babelTypes.ImportDeclaration>,
) {
  const source = path.get('source')

  if (!source.isStringLiteral()) {
    return
  }

  const requireIdentifier = babelTypes.identifier('require')

  const importSpecifiers = path.get('specifiers')

  if (importSpecifiers.length === 1) {
    const specifier = importSpecifiers[0]

    if (specifier?.isImportNamespaceSpecifier()) {
      return babelTypes.variableDeclaration('const', [
        babelTypes.variableDeclarator(
          specifier.node.local,
          babelTypes.callExpression(
            requireIdentifier,
            [source.node],
          ),
        ),
      ])
    }
  }

  return babelTypes.variableDeclaration('const', [
    babelTypes.variableDeclarator(
      babelTypes.objectPattern(
        importSpecifiers.flatMap((specifier) => {
          if (specifier.isImportDefaultSpecifier()) {
            return babelTypes.objectProperty(
              babelTypes.identifier('default'),
              specifier.node.local,
            )
          }

          if (specifier.isImportSpecifier()) {
            return babelTypes.objectProperty(
              specifier.node.imported,
              specifier.node.local,
            )
          }

          return []
        }),
      ),
      babelTypes.callExpression(
        requireIdentifier,
        [source.node],
      ),
    ),
  ])
}
