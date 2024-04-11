import { checksum } from "./checksum"
import type { CreateRouteOptions } from "../create-route/create-route"
import { Route } from "../types/route"

/**
 * @param route The route to get the name of.
 * @param route_options The options for the route.
 * @returns The route handler.
 */
export function getRouteName(
  route: Route,
  // eslint-disable-next-line functional/prefer-immutable-types
  route_options?: CreateRouteOptions<any, any> | undefined,
): string {
  if (route_options?.path !== undefined) {
    return route_options.path.startsWith("/")
      ? route_options.path.slice(1)
      : route_options.path
  }

  if (route.name) {
    return route.name
  }

  const stringified_route = route.toString().replaceAll(/\s/g, "")
  const route_checksum = checksum(stringified_route)

  return route_checksum
}
