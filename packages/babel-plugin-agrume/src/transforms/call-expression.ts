import { createRoute } from '@agrume/core'
import { type NodePath, types as babelTypes, PluginPass } from '@babel/core'
import agrume_package_json from 'agrume/package.json'

import { createArgumentLoader } from '../utils/create-argument-loader'

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

  if (!callee.referencesImport(agrume_package_json.name, createRoute.name)) {
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
  const second_argument = callPath.get('arguments')[1]

  if (first_argument === undefined ||
    (!first_argument.isFunctionExpression() &&
      !first_argument.isArrowFunctionExpression())
  ) {
    return
  }

  if (second_argument !== undefined && !second_argument.isObjectExpression()) {
    return
  }

  const route_function_path = first_argument
  const route_function_loader = createArgumentLoader(
    route_function_path,
    file_path,
  )

  if (route_function_loader === undefined) {
    throw new TypeError('Unexpected route_function_loader undefined.')
  }

  const route_options_path = second_argument
  const route_options_loader = route_options_path === undefined
    ? undefined
    : createArgumentLoader(
      route_options_path,
      file_path,
    )

  const route = new Function(`return (${route_function_loader})()`)()
  const route_options = route_options_loader === undefined
    ? undefined
    : new Function(`return (${route_options_loader})()`)()

  const requestClient = createRoute(route, route_options)
  void callPath.replaceWithSourceString(requestClient.toString())

  return undefined
}

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
function TypesAreSame<T1, _T2 extends T1>(): true {
  return true
}
