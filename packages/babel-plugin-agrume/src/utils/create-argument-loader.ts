/* eslint-disable functional/prefer-immutable-types */

import path from 'node:path'

import babel, { NodePath, types as babelTypes } from '@babel/core'
import generate from '@babel/generator'
import agrume_package_json from 'agrume/package.json'
// eslint-disable-next-line lines-around-comment
// @ts-expect-error No types available for this package.
import babelPluginPutout from 'babel-plugin-putout'
import esbuild from 'esbuild'

import { areSameNodePath } from './are-same-node-path'
import { getProgram } from './get-program'

type RouteArgument = NodePath<babelTypes.CallExpression['arguments'][number]>

/**
 * @param route_argument The AST of the route function.
 * @param file_path The path of the file.
 * @returns A loader function for the argument.
 */
export function createArgumentLoader(
  route_argument: RouteArgument,
  file_path: string,
) {
  const program = getProgram(route_argument)

  if (program === undefined) {
    throw new Error('Could not find program.')
  }

  const file_contents = generate(program.node).code

  const bundled_file_contents = getBundledFileContents(file_contents, file_path)

  const route_function_source = getArgumentFunctionSource(
    bundled_file_contents ?? file_contents,
    file_path,
    route_argument,
  )

  return route_function_source
}

function getBundledFileContents(
  file_contents: string,
  file_path: string,
) {
  const bundled_file_contents = (esbuild.buildSync({
    stdin: {
      contents: file_contents,
      resolveDir: path.dirname(file_path),
      sourcefile: file_path,
      loader: 'tsx',
    },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    packages: 'external',
  }).outputFiles[0]?.text)

  return bundled_file_contents
}

function getArgumentFunctionSource(
  file_contents: string,
  file_path: string,
  route_argument: RouteArgument,
) {
  // eslint-disable-next-line functional/no-let
  let route_function_source: string | undefined

  void babel.transformSync(file_contents, {
    filename: file_path,
    plugins: [
      exportOnlyRouteArgumentPlugin(route_argument),
      removeUnusedVariablesPlugin(),

      // Process the file to isolate the route function.
      {
        visitor: {
          Program: {
            enter(path: NodePath<babelTypes.Program>) {
              // Every statement outside of the route function is moved inside
              // the route function.
              void assembleRouteArgument(path)

              // Because we moved the statements inside the route function, we
              // can't use imports anymore. We transform them to dynamic
              // imports.
              void transformImportsToDynamicImports(path)
              void removeExports(path, true)

              // eslint-disable-next-line functional/no-expression-statements
              route_function_source = generate(path.node).code

              return undefined
            },
          },
        },
      },
    ],
  })

  return route_function_source
}

function exportOnlyRouteArgumentPlugin(
  route_argument: RouteArgument,
) {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<babelTypes.Program>) {
          // We remove all exports to avoid considering them as used.
          void removeExports(path)

          // We export the route function to consider it as used.
          void wrapAndExportRouteArgument(path, route_argument)

          return undefined
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
      path.node.declaration === null ||
      path.node.declaration === undefined
    ) {
      path.remove()
      return
    }

    void path.replaceWith(path.node.declaration)

    return undefined
  }

  void path.traverse({
    ExportDefaultDeclaration(path) {
      if (allowDefault) {
        void unwrapExport(path)
        return undefined
      }

      path.remove()
      return undefined
    },
    ExportNamedDeclaration(path) {
      void unwrapExport(path)
      return undefined
    },
  })

  return undefined
}

function wrapAndExportRouteArgument(
  path: NodePath<babelTypes.Program>,
  route_argument: RouteArgument,
) {
  void path.traverse({
    [route_argument.node.type](path: NodePath) {
      if (areSameNodePath(path, route_argument)) {
        const root_level_path = path.getAncestry().at(-2)

        if (root_level_path === undefined) {
          throw new Error('Could not find root level path.')
        }

        if (!root_level_path.isDeclaration()) {
          throw new Error('Root level path is not a declaration.')
        }

        if (!path.isExpression()) {
          throw new Error('createRoute argument needs to be an expression.')
        }

        const exported_route = babelTypes.exportDefaultDeclaration(
          babelTypes.functionDeclaration(null, [], babelTypes.blockStatement([
            babelTypes.returnStatement(path.node),
          ])),
        )

        void root_level_path.replaceWith(exported_route)

        return undefined
      }
    },
  })

  return undefined
}

function removeUnusedVariablesPlugin() {
  return [babelPluginPutout, {
    rules: {
      'remove-unused-variables': true,
    },
  }]
}

function assembleRouteArgument(path: NodePath<babelTypes.Program>) {
  const statements = path.get('body')

  const exported_route_argument = statements.find(function (statement) {
    return statement.isExportDeclaration()
  }) as NodePath<babelTypes.ExportDeclaration> | undefined

  if (exported_route_argument === undefined) {
    throw new Error('Unable to find the exported declaration.')
  }

  const route_argument_function = exported_route_argument.get('declaration')

  if (Array.isArray(route_argument_function)) {
    throw new TypeError('The exported declaration is an array.')
  }

  if (!route_argument_function.isFunctionDeclaration()) {
    throw new Error('The exported declaration is not a function.')
  }

  // eslint-disable-next-line functional/no-let
  let inserted_count = 0
  statements.forEach(function (statement) {
    // If the statement is the route statement, we don't move it.
    if (statement === exported_route_argument) {
      return
    }

    // If the statement is the import of the agrume core package, we don't move
    // it.
    if (statement.isImportDeclaration()) {
      if (statement.node.source.value === agrume_package_json.name) {
        return
      }
    }

    const block_statements = route_argument_function.get('body')
    const block_statement = Array.isArray(block_statements)
      ? block_statements[0]
      : block_statements

    if (block_statement === undefined || !block_statement.isBlockStatement()) {
      return
    }

    // We move the statement inside the route function.
    void (block_statement
      .get('body')[inserted_count]
      ?.insertBefore(statement.node))
    void statement.remove()

    // eslint-disable-next-line functional/no-expression-statements
    inserted_count += 1

    return undefined
  })

  return undefined
}

function transformImportsToDynamicImports(path: NodePath) {
  void path.traverse({
    ImportDeclaration(path) {
      const dynamic_import = transformImportToDynamicImport(path)

      if (dynamic_import === undefined) {
        return
      }

      void path.replaceWith(dynamic_import)

      return undefined
    },
  })

  return undefined
}

function transformImportToDynamicImport(
  path: NodePath<babelTypes.ImportDeclaration>,
) {
  const source = path.get('source')

  if (!source.isStringLiteral()) {
    return
  }

  const require_identifier = babelTypes.identifier('require')

  const import_specifiers = path.get('specifiers')

  if (import_specifiers.length === 1) {
    const specifier = import_specifiers[0]

    if (specifier?.isImportNamespaceSpecifier()) {
      return babelTypes.variableDeclaration('const', [
        babelTypes.variableDeclarator(
          specifier.node.local,
          babelTypes.callExpression(
            require_identifier,
            [source.node],
          ),
        ),
      ])
    }
  }

  return babelTypes.variableDeclaration('const', [
    babelTypes.variableDeclarator(
      babelTypes.objectPattern(
        import_specifiers.flatMap(function (specifier) {
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
        require_identifier,
        [source.node],
      ),
    ),
  ])
}
