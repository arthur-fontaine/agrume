import { createRoute, getOptions, getRouteName } from '@agrume/core'
import core_package_json from '@agrume/core/package.json'
import { type NodePath, types as babelTypes, PluginPass } from '@babel/core'

import { buildRouteFunction } from '../utils/build-route-file'

/**
 * @param callPath The call expression path.
 * @param state The plugin state.
 * @returns Nothing.
 */
export function transformCallExpression(
  // eslint-disable-next-line functional/prefer-immutable-types
  callPath: NodePath<babelTypes.CallExpression>,
  // eslint-disable-next-line functional/prefer-immutable-types
  state: PluginPass,
) {
  const callee = callPath.get('callee')

  if (!callee.referencesImport(core_package_json.name, createRoute.name)) {
    return
  }

  // At this point, we know that the callee is a reference to the `createRoute`
  // function.

  void transformCreateRoute(callPath, state)

  return undefined
}

function transformCreateRoute(
  // eslint-disable-next-line functional/prefer-immutable-types
  callPath: NodePath<babelTypes.CallExpression>,
  // eslint-disable-next-line functional/prefer-immutable-types
  state: PluginPass,
) {
  // We check at devtime that the `createRoute` function is called with a
  // function as its first argument.
  void TypesAreSame<Parameters<typeof createRoute>[0], () => any>()

  const file_path = state.filename ?? state.file.opts.filename

  if (file_path === undefined || file_path === null) {
    throw new Error('Could not find file path.')
  }

  // Now we are sure that the first argument should be a function.
  const first_argument = callPath.get('arguments')[0]

  if (first_argument === undefined ||
    (!first_argument.isFunctionExpression() &&
      !first_argument.isArrowFunctionExpression())
  ) {
    return
  }

  const route_function = first_argument
  const built_route_function = buildRouteFunction(route_function, file_path)

  const route = new Function(`return ${built_route_function}`)()

  const route_name = getRouteName(route)
  const prefix = getOptions().prefix

  const requestClient = createRoute(route)
  void callPath.replaceWithSourceString(`(...args) => {
    const route_name = ${JSON.stringify(route_name)}
    const prefix = ${JSON.stringify(prefix)}
    return (${requestClient.toString()})(...args)
  }`)

  return undefined
}

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
function TypesAreSame<T1, _T2 extends T1>(): true {
  return true
}
