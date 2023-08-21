/* eslint-disable functional/prefer-immutable-types */

import path from 'node:path'

import core_package_json from '@agrume/core/package.json'
import babel, { type NodePath, types as babelTypes } from '@babel/core'
import generate from '@babel/generator'
// eslint-disable-next-line lines-around-comment
// @ts-expect-error No types available for this package.
import babelPluginPutout from 'babel-plugin-putout'
import esbuild from 'esbuild'

import { areSameNodePath } from './are-same-node-path'
import { getProgram } from './get-program'

type RouteAst = (
  | NodePath<babelTypes.FunctionExpression>
  | NodePath<babelTypes.ArrowFunctionExpression>
)

/**
 * @param route_ast The AST of the route function.
 * @param file_path The path of the file.
 * @returns The route file.
 */
export function buildRouteFunction(
  route_ast: RouteAst,
  file_path: string,
) {
  const program = getProgram(route_ast)

  if (program === undefined) {
    throw new Error('Could not find program.')
  }

  const file_contents = generate(program.node).code

  const bundled_file_contents = getBundledFileContents(file_contents, file_path)

  const route_function_source = getRouteFunctionSource(
    bundled_file_contents ?? file_contents,
    file_path,
    route_ast,
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

function getRouteFunctionSource(
  file_contents: string,
  file_path: string,
  route_ast: RouteAst,
) {
  // eslint-disable-next-line functional/no-let
  let route_function_source: string | undefined

  void babel.transformSync(file_contents, {
    filename: file_path,
    plugins: [
      exportOnlyRouteFunctionPlugin(route_ast),
      removeUnusedVariablesPlugin(),

      // Process the file to isolate the route function.
      {
        visitor: {
          Program: {
            enter(path: NodePath<babelTypes.Program>) {
              // Every statement outside of the route function is moved inside
              // the route function.
              void assembleRoute(path)

              // Because we moved the statements inside the route function, we
              // can't use imports anymore. We transform them to dynamic
              // imports.
              void transformImportsToDynamicImports(path)

              // eslint-disable-next-line functional/no-expression-statements
              route_function_source = isolateRouteFunction(path, route_ast)

              return undefined
            },
          },
        },
      },
    ],
  })

  return route_function_source
}

function exportOnlyRouteFunctionPlugin(
  route_ast: RouteAst,
) {
  return {
    visitor: {
      Program: {
        enter(path: NodePath<babelTypes.Program>) {
          // We remove all exports to avoid considering them as used.
          void removeExports(path)

          // We export the route function to consider it as used.
          void exportRoute(path, route_ast)

          return undefined
        },
      },
    },
  }
}

function removeExports(path: NodePath) {
  void path.traverse({
    ExportDefaultDeclaration(path) {
      path.remove()
      return undefined
    },
    ExportNamedDeclaration(path) {
      if (
        path.node.declaration === null ||
        path.node.declaration === undefined
      ) {
        path.remove()
        return
      }

      void path.replaceWith(path.node.declaration)

      return undefined
    },
  })

  return undefined
}

function exportRoute(
  path: NodePath<babelTypes.Program>,
  route_ast: RouteAst,
) {
  void path.traverse({
    [route_ast.node.type](path: NodePath) {
      if (areSameNodePath(path, route_ast)) {
        const root_level_path = path.getAncestry().at(-2)

        if (root_level_path === undefined) {
          throw new Error('Could not find root level path.')
        }

        if (!root_level_path.isDeclaration()) {
          throw new Error('Root level path is not a declaration.')
        }

        const exported_route = babelTypes.exportNamedDeclaration(
          root_level_path.node,
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

function assembleRoute(path: NodePath<babelTypes.Program>) {
  const statements = path.get('body')

  const route_statement = statements.find(function (statement) {
    return statement.isExportNamedDeclaration()
  })
  if (!route_statement?.isExportNamedDeclaration()) {
    return
  }

  const route_function = findRouteFunction(route_statement)
  if (route_function === undefined) {
    return
  }

  // eslint-disable-next-line functional/no-let
  let inserted_count = 0
  statements.forEach(function (statement) {
    // If the statement is the route statement, we don't move it.
    if (statement === route_statement) {
      return
    }

    // If the statement is the import of the agrume core package, we don't move
    // it.
    if (statement.isImportDeclaration()) {
      if (statement.node.source.value === core_package_json.name) {
        return
      }
    }

    // We move the statement inside the route function.
    void (route_function
      .get('body')
      .get('body')[inserted_count]
      ?.insertBefore(statement.node))
    void statement.remove()

    // eslint-disable-next-line functional/no-expression-statements
    inserted_count += 1

    return undefined
  })

  return undefined
}

function findRouteFunction(
  route_statement: NodePath<babelTypes.ExportNamedDeclaration>,
) {
  // eslint-disable-next-line functional/no-let
  let route_function: NodePath<babelTypes.FunctionExpression> | undefined
  void route_statement?.traverse({
    FunctionExpression(path) {
      if (route_function !== undefined) {
        return
      }
      // eslint-disable-next-line functional/no-expression-statements
      route_function = path
      return undefined
    },
  })

  return route_function
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

  const import_specifiers = path.get('specifiers')

  if (import_specifiers.length === 1) {
    const specifier = import_specifiers[0]

    if (specifier?.isImportNamespaceSpecifier()) {
      return babelTypes.variableDeclaration('const', [
        babelTypes.variableDeclarator(
          specifier.node.local,
          babelTypes.awaitExpression(
            babelTypes.callExpression(
              babelTypes.import(),
              [source.node],
            ),
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
      babelTypes.awaitExpression(
        babelTypes.callExpression(
          babelTypes.import(),
          [source.node],
        ),
      ),
    ),
  ])
}

function isolateRouteFunction(
  path: NodePath<babelTypes.Program>,
  route_ast: RouteAst,
) {
  // We remove all statements outside of the route function.
  path.get('body').forEach(function (statement) {
    if (statement.isExportNamedDeclaration()) {
      return
    }

    void statement.remove()

    return undefined
  })

  // eslint-disable-next-line functional/no-let
  let route_function_string: string | undefined

  void path.traverse({
    ExportNamedDeclaration(path) {
      if (
        path.node.declaration === null ||
        path.node.declaration === undefined
      ) {
        path.remove()
        return
      }

      const declarations = path.get('declaration').get('declarations')
      const declaration = Array.isArray(declarations)
        ? declarations[0]?.get('init')
        : declarations.get('init')

      if (declaration === undefined) {
        return
      }

      if (Array.isArray(declaration)) {
        return
      }

      void declaration.traverse({
        [route_ast.node.type as any](path: RouteAst) {
          // eslint-disable-next-line functional/no-conditional-statements
          if (route_function_string === undefined) {
            // eslint-disable-next-line functional/no-expression-statements
            route_function_string = generate(path.node).code
          }

          return undefined
        },
      })

      return undefined
    },
  })

  return route_function_string
}
