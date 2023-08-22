import babelParser from "@babel/parser"

import { RequestOptions, getRequestOptions } from "./get-request-options"
import { getAgrumeOptions } from "../options"
import {
  _isRouteRegistrationActive, _registerRoute,
} from "../route-registration"
import { Route } from "../types/route"
import { getRouteName } from "../utils/get-route-name"

// eslint-disable-next-line @typescript-eslint/naming-convention
type Client<_Route extends Route<any, any>> = (
  (parameters: Parameters<_Route>[0]) => ReturnType<_Route>
)

type GetClient<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Route extends Route<any, any>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Client,
// eslint-disable-next-line functional/prefer-immutable-types
> = (requestOptions: RequestOptions) => _Client

interface CreateRouteOptions<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Route extends Route<any, any>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Client = unknown,
> {
  getClient?: GetClient<_Route, _Client> | undefined
}

type CreateRouteOptionsWithUndefinedClient<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Route extends Route<any, any>,
> = CreateRouteOptions<_Route, undefined>

type CreateRouteOptionsWithFunctionClient<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Route extends Route<any, any>,
  // eslint-disable-next-line max-len
  // eslint-disable-next-line functional/prefer-immutable-types, @typescript-eslint/naming-convention
  _Client,
> = CreateRouteOptions<_Route, _Client>

// eslint-disable-next-line @typescript-eslint/naming-convention
type ReturnedDefaultClient<_Route extends Route<any, any>> = (
  ReturnType<
    typeof getDefaultClient<_Route>
  >
)

// eslint-disable-next-line @typescript-eslint/naming-convention
type ReturnedCustomFunctionClient<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Route extends Route<any, any>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Options extends CreateRouteOptionsWithFunctionClient<_Route, any>,
> = (
    _Options["getClient"] extends undefined
    ? never
    : ReturnType<NonNullable<_Options["getClient"]>>
  )

// eslint-disable-next-line @typescript-eslint/naming-convention
export function createRoute<_Route extends Route<any, any>>(
  route: _Route,
  options?: never,
): ReturnedDefaultClient<_Route>

// eslint-disable-next-line @typescript-eslint/naming-convention
export function createRoute<_Route extends Route<any, any>>(
  route: _Route,
  // eslint-disable-next-line functional/prefer-immutable-types
  options?: CreateRouteOptionsWithUndefinedClient<_Route>
): ReturnedDefaultClient<_Route>

export function createRoute<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Route extends Route<any, any>,
  // eslint-disable-next-line max-len
  // eslint-disable-next-line functional/prefer-immutable-types, @typescript-eslint/naming-convention
  _Client extends Client<Route<Parameters<_Route>[0], any>>,
>(
  route: _Route,
  // eslint-disable-next-line functional/prefer-immutable-types
  options: CreateRouteOptionsWithFunctionClient<_Route, _Client>,
): ReturnedCustomFunctionClient<
  _Route,
  CreateRouteOptionsWithFunctionClient<_Route, _Client>
>

/**
 * @param route The handler for the route.
 * @param options The options.
 * @returns A function that can be used to call the route.
 */
export function createRoute<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Route extends Route<any, any>,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _Options extends CreateRouteOptions<_Route, unknown> | undefined,
>(route: _Route, options: _Options) {
  const route_name = getRouteName(route)
  const prefix = getAgrumeOptions().prefix

  // eslint-disable-next-line functional/no-conditional-statements
  if (_isRouteRegistrationActive()) {
    void _registerRoute(route_name, route)
  }

  const request_options = getRequestOptions(`${prefix}${route_name}`)

  const getClient = options?.getClient ?? getDefaultClient

  const stringified_get_client = getClient.toString()

  // If Babel cannot parse the function, it means that the function keyword is
  // missing.

  // eslint-disable-next-line functional/no-let
  let should_add_function_keyword = false
  try {
    void babelParser.parseExpression(stringified_get_client)
  } catch (error) {
    // eslint-disable-next-line functional/no-expression-statements
    should_add_function_keyword = true
  }

  const formatted_stringified_get_client = (
    `${should_add_function_keyword ? 'function ' : ''}${stringified_get_client}`
  )

  const make_request = new Function(`
    return (function (...args) {
      const request_options = ${JSON.stringify(request_options)}
      const client = (${formatted_stringified_get_client})(request_options)
      return client(...args)
    })
  `)()

  return make_request
}

// eslint-disable-next-line @typescript-eslint/naming-convention
const getDefaultClient = function <_Route extends Route<any, any>>(
  // eslint-disable-next-line functional/prefer-immutable-types
  request_options: RequestOptions,
): Client<_Route> {
  return function (parameters: Parameters<_Route>[0]) {
    return (fetch(request_options.url, {
      ...request_options,
      body: JSON.stringify(parameters),
    })
      .then(function (response) {
        return response.json()
      })) as ReturnType<_Route>
  }
}
