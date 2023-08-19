import { checksum } from "./checksum"
import { Route } from "../types/route"

/**
 * @param route The route to get the name of.
 * @returns The route handler.
 */
export function getRouteName(route: Route): string {
  if (route.name) {
    return route.name
  }

  const stringified_route = route.toString().replaceAll(/\s/g, "")
  const route_checksum = checksum(stringified_route)

  return route_checksum
}
