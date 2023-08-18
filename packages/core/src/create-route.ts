import { JsonValue } from "type-fest"

import {
  _isRouteRegistrationActive, _registerRoute,
} from "./route-registration"
import { ReturnedRoute, Route } from "./types/route"

/**
 * @param route_name The name of the route.
 * @param route The handler for the route.
 * @returns A function that can be used to call the route.
 */
export function createRoute<
  R extends Route<_>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _ extends Promise<JsonValue>,
>(route_name: string, route: R): ReturnedRoute<R> {
  if (_isRouteRegistrationActive()) {
    void _registerRoute(route_name, route)
    return null as never
  }

  return async function (parameters) {
    return (fetch(`/api/${route_name}`, {
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
