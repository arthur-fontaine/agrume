/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */

import { state } from "./state"
import { Route } from "./types/route"

/**
 * Starts the route registration process.
 * @returns The new state of the route registration.
 */
export function _startRouteRegistration() {
  state.isRegistering = true
  return state.isRegistering
}

/**
 * Stops the route registration process.
 * @returns The new state of the route registration.
 */
export function _stopRouteRegistration() {
  state.isRegistering = false
  return state.isRegistering
}

/**
 * Gets the current state of the route registration.
 * @returns The current state of the route registration.
 */
export function _isRouteRegistrationActive() {
  return state.isRegistering
}

/**
 * Registers a route.
 * @param route_name The name of the route.
 * @param route The route to register.
 * @returns The new state of the route registration.
 */
export function _registerRoute(route_name: string, route: Route) {
  state.routes.set(route_name, route)
  return state.routes
}

/**
 * Gets the routes.
 * @returns The routes.
 */
export function _getRoutes() {
  return state.routes
}
