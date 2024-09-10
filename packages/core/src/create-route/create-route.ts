import { state, utils } from '@agrume/internals'
import type { AnyRoute, CreateRoute, DefaultClient, RequestOptions, Route, RouteOptions, RouteParameters, RouteReturnValue } from '@agrume/types'
import babelParser from '@babel/parser'

import { options } from './options'
import { getRouteName } from './get-route-name'
import { getRequestOptions } from './get-request-options'

const impossibleTypeSymbol = Symbol('Impossible type')
type ImpossibleType<T> = T & {
  [impossibleTypeSymbol]: typeof impossibleTypeSymbol
}

type ValidateRoute<R extends AnyRoute, _> =
  (R extends Route<infer RP, infer RRV>
    ? RP extends RouteParameters
      ? RRV extends RouteReturnValue
        ? _
        : ImpossibleType<'The return value of the route is invalid. It must be a JSON value.'>
      : ImpossibleType<'The parameters of the route are invalid. The parameters must be a JSON value.'>
    : ImpossibleType<'The route is invalid. It must be a function. The parameters and the return value must be a JSON value.'>) & _

/**
 * Creates a route.
 * @param {AnyRoute} route The handler for the route.
 * @param {RouteOptions} routeOptions The options.
 * @returns {Function} A function that can be used to call the route.
 */
export function createRoute<
  R extends AnyRoute,
  O extends RouteOptions<R, unknown> | undefined,
>(
  route: ValidateRoute<R, R>,
  routeOptions?: ValidateRoute<R, O>,
): R extends Route<infer RP, infer RRV>
    ? RP extends RouteParameters
      ? RRV extends RouteReturnValue
        ? ReturnType<CreateRoute<R, undefined extends O ? undefined : O>>
        : never
      : never
    : never {
  const routeName = getRouteName(route, routeOptions)
  const prefix = options.get().prefix

  let host = ''

  const baseUrl = options.get().baseUrl?.slice(0, -1) // .slice(0, -1) removes the trailing slash, because prefix already has it
  if (baseUrl !== undefined) {
    host = baseUrl
  }

  const tunnelType = options.get().tunnel?.type
  if (tunnelType !== undefined) {
    const tunnelInfos = utils.getTunnelInfos(tunnelType)

    if (tunnelInfos.type === 'localtunnel') {
      host = `https://${tunnelInfos.tunnelSubdomain}.${tunnelInfos.tunnelDomain}`
    }
    else if (tunnelInfos.type === 'bore') {
      host = `http://${tunnelInfos.tunnelDomain}:${tunnelInfos.tunnelPort}`
    }
  }

  if (state.get()?.isRegistering) {
    state.set((state) => {
      state.routes.set(routeName, route)
      return state
    })
  }

  const requestOptions = getRequestOptions(`${host}${prefix}${routeName}`)
  const globalConfiguredClient = options.get().getClient

  const getClient = (
    routeOptions?.getClient
    ?? globalConfiguredClient
    ?? getDefaultClient
  )
  let stringifiedGetClient = getClient.toString()

  // If Babel cannot parse the function, it means that the function keyword may be
  // missing and we need to add it.
  try {
    babelParser.parseExpression(stringifiedGetClient)
  }
  catch (error) {
    if (!stringifiedGetClient.trim().startsWith('function')) {
      stringifiedGetClient = `function ${stringifiedGetClient}`
    }
  }

  // eslint-disable-next-line no-eval
  const makeRequest = eval(/* js */`
    (...args) => {
      const client = (${stringifiedGetClient})(${JSON.stringify(requestOptions)}, {})
      return client(...args)
    }
  `)

  return makeRequest
}

function getDefaultClient<R extends AnyRoute>(
  requestOptions: RequestOptions,
): DefaultClient<R> {
  return async function (parameters: Parameters<R>[0]) {
    const response = await fetch(requestOptions.url, {
      ...requestOptions,
      body: JSON.stringify(parameters),
    })

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }

    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const getAsyncGenerator = async function* () {
        const reader = response
          .body
          ?.pipeThrough(new TextDecoderStream())
          .getReader()

        if (reader === undefined) {
          return
        }

        while (true) {
          const { done, value: unformattedValue } = await reader.read()

          if (done) {
            return
          }

          const unformattedValues = unformattedValue.split('\n\n')

          for (const unformattedValue of unformattedValues) {
            if (unformattedValue === '') {
              continue
            }

            const DATA_PREFIX = 'data: '
            const data = unformattedValue.startsWith(DATA_PREFIX)
              ? unformattedValue.slice(DATA_PREFIX.length)
              : unformattedValue

            if (data === 'DONE') {
              return
            }

            const RETURN_PREFIX = 'RETURN'
            if (data.startsWith(RETURN_PREFIX)) {
              return JSON.parse(data.slice(RETURN_PREFIX.length))
            }

            yield JSON.parse(data)
          }
        }
      }

      return getAsyncGenerator()
    }
  } as never
}
