import { createRoute, getRouteName } from '@agrume/core'
import core_package_json from '@agrume/core/package.json'
import { type NodePath, types as babelTypes } from '@babel/core'

/**
 * @param callPath The call expression path.
 * @returns Nothing.
 */
export function transformCallExpression(
  // eslint-disable-next-line functional/prefer-immutable-types
  callPath: NodePath<babelTypes.CallExpression>,
) {
  const callee = callPath.get('callee')

  if (!callee.referencesImport(core_package_json.name, createRoute.name)) {
    return
  }

  // At this point, we know that the callee is a reference to the `createRoute`
  // function.

  void transformCreateRoute(callPath)

  return undefined
}

function transformCreateRoute(
  // eslint-disable-next-line functional/prefer-immutable-types
  callPath: NodePath<babelTypes.CallExpression>,
) {
  // We check at devtime that the `createRoute` function is called with a
  // function as its first argument.
  void TypesAreSame<Parameters<typeof createRoute>[0], () => any>()

  // Now we are sure that the first argument should be a function.
  const first_argument = callPath.get('arguments')[0]

  if (first_argument === undefined ||
    (!first_argument.isFunctionExpression() &&
      !first_argument.isArrowFunctionExpression())
  ) {
    return
  }

  const stringified_function = first_argument.getSource()
  const route = new Function(`return ${stringified_function}`)()

  const route_name = getRouteName(route)

  const requestClient = createRoute(route)

  void callPath.replaceWithSourceString(`(...args) => {
    const route_name = ${JSON.stringify(route_name)}
    return (${requestClient.toString()})(...args)
  }`)

  return undefined
}

// eslint-disable-next-line max-len
// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars
function TypesAreSame<T1, _T2 extends T1>(): true {
  return true
}
