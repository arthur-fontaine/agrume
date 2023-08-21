import { JsonValue } from "type-fest"

import { getOptions } from "./options"
import {
  _isRouteRegistrationActive, _registerRoute,
} from "./route-registration"
import { ReturnedRoute, Route } from "./types/route"
import { getRouteName } from "./utils/get-route-name"

/**
 * @param route The handler for the route.
 * @returns A function that can be used to call the route.
 */
export function createRoute<
  R extends Route<_>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _ extends Promise<JsonValue>,
>(route: R): ReturnedRoute<R> {
  const route_name = getRouteName(route)
  const prefix = getOptions().prefix

  // eslint-disable-next-line functional/no-conditional-statements
  if (_isRouteRegistrationActive()) {
    void _registerRoute(route_name, route)
  }

  return async function (parameters) {
    return (fetch(`${prefix}${route_name}`, {
      body: JSON.stringify(parameters),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })
      .then(function (response) {
        return response.json()
      }))
  }
}
