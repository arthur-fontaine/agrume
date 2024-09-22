import { createRequire } from 'node:module'

import importSync from 'import-sync'
import { createRoute } from '@agrume/core'
import type { NodePath, PluginPass, types as babelTypes } from '@babel/core'
import agrumePackageJson from 'agrume/package.json'

import { createArgumentLoader } from '../utils/create-argument-loader'

/**
 * Transform the call expressions to the `createRoute` Agrume function.
 * @param {NodePath<babelTypes.CallExpression>} callPath The call path.
 * @param {PluginPass} state The state.
 * @returns {Error | undefined} An error if any.
 */
export function transformCallExpression(
  callPath: NodePath<babelTypes.CallExpression>,
  state: PluginPass,
): Error | undefined {
  const callee = callPath.get('callee')

  // FIXME: We may not hardly code the function name here (createRoute).
  if (!callee.referencesImport(agrumePackageJson.name, 'createRoute')) {
    return
  }

  // At this point, we know that the callee is a reference to the `createRoute` function.

  return transformCreateRoute(callPath, state)
}

function transformCreateRoute(
  callPath: NodePath<babelTypes.CallExpression>,
  state: PluginPass,
): Error | undefined {
  // We check at devtime that the `createRoute` function is called with a
  // function as its first argument.
  // eslint-disable-next-line ts/no-explicit-any
  TypesAreSame<Parameters<typeof createRoute>[0], () => any>()

  const filePath = state.filename ?? state.file.opts.filename

  if (filePath === undefined || filePath === null) {
    return new Error('Could not find file path.')
  }

  // Now we are sure that the first argument should be a function.
  const firstArgument = callPath.get('arguments')[0]
  const secondArgument = callPath.get('arguments')[1]

  if (firstArgument === undefined
    || (!firstArgument.isExpression()
    && !firstArgument.isIdentifier())
  ) {
    return
  }

  if (
    secondArgument !== undefined
    && !secondArgument.isExpression()
    && !secondArgument.isIdentifier()) {
    return
  }

  const routeFunctionPath = firstArgument
  const routeFunctionLoader = createArgumentLoader(
    routeFunctionPath,
    filePath,
  )

  if (routeFunctionLoader === undefined) {
    return new TypeError('Unexpected routeFunctionLoader undefined.')
  }

  if (routeFunctionLoader instanceof Error) {
    return routeFunctionLoader
  }

  const routeOptionsPath = secondArgument
  const routeOptionsLoader = routeOptionsPath === undefined
    ? undefined
    : createArgumentLoader(
      routeOptionsPath,
      filePath,
    )

  if (routeOptionsLoader instanceof Error) {
    return routeOptionsLoader
  }

  const route = runLoader(routeFunctionLoader, filePath)
  const routeOptions = routeOptionsLoader === undefined
    ? undefined
    : runLoader(routeOptionsLoader, filePath)

  const requestClient = createRoute(route, routeOptions)
  callPath.replaceWithSourceString(requestClient.toString())

  return undefined
}

function runLoader(loader: string, filePath: string) {
  const _require = createRequire(filePath.startsWith('file://') ? filePath : `file://${filePath}`)

  function _import(moduleName: string) {
    const modulePath = _require.resolve(moduleName)
    const module = importSync(modulePath)

    if (module && module.__esModule) {
      return module
    }

    return {
      default: module,
      ...(typeof module === 'object' ? module : {}),
    }
  }

  // eslint-disable-next-line no-new-func
  return new Function('_import', `return (${loader})`)(_import)()
}

function TypesAreSame<T1, _T2 extends T1>(): true {
  return true
}
