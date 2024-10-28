import { utils } from '@agrume/internals'

import type { AnyRoute, RouteOptions } from '@agrume/types'

/**
 * Get the name of a route.
 * @param {AnyRoute} route The route to get the name of.
 * @param {RouteOptions} routeOptions The options of the route.
 * @returns {string} The name of the route.
 */
export function getRouteName(
  route: AnyRoute,
  routeOptions?: RouteOptions<AnyRoute, unknown> | undefined,
): string {
  if (routeOptions?.path !== undefined) {
    return routeOptions.path.startsWith('/')
      ? routeOptions.path.slice(1)
      : routeOptions.path
  }

  if (route.name) {
    return route.name
  }

  const stringifiedRoute = route.toString().replaceAll(/\s/g, '')
  const routeChecksum = utils.checksum(stringifiedRoute)

  return routeChecksum
}
