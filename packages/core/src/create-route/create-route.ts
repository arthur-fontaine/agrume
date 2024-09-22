import { state, utils } from '@agrume/internals'
import type { AnyRoute, Client, CreateRoute, RequestOptions, RouteOptions, RouteReturnValue } from '@agrume/types'
import babelParser from '@babel/parser'

import { options } from './options'
import { getRouteName } from './get-route-name'
import { getRequestOptions } from './get-request-options'

/**
 * Creates a route.
 * @param {AnyRoute} route The handler for the route.
 * @param {RouteOptions} routeOptions The options.
 * @returns {Function} A function that can be used to call the route.
 */
export function createRoute<
  RRV extends RouteReturnValue,
  R extends AnyRoute<RRV>,
  O extends RouteOptions<R, unknown> | undefined,
>(route: R, routeOptions?: O): ReturnType<
  CreateRoute<R, undefined extends O ? undefined : O>
> {
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

  const getClient = routeOptions?.getClient ?? getDefaultClient
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
      const client = (${stringifiedGetClient})(${JSON.stringify(requestOptions)})
      return client(...args)
    }
  `)

  return makeRequest
}

function getDefaultClient<R extends AnyRoute>(
  requestOptions: RequestOptions,
): Client<R> {
  function isAsyncGenerator<T, R, N>(
    // eslint-disable-next-line ts/no-explicit-any
    value: any,
  ): value is AsyncGenerator<T, R, N> {
    if (!value) {
      return false
    }

    const asyncGenerator
      = (async function* () { yield undefined }()).constructor

    return value.constructor.constructor === asyncGenerator.constructor
  }

  return async function (parameters: Parameters<R>[0]) {
    const agrumeRid = crypto.randomUUID()

    const response = await fetch(requestOptions.url, {
      ...requestOptions,
      ...(!isAsyncGenerator(parameters) && {
        body: JSON.stringify(parameters),
      }),
      headers: {
        ...requestOptions.headers,
        ...(isAsyncGenerator(parameters) && {
          'X-Agrume-Rid-Stream': agrumeRid,
        }),
      },
    })

    if (isAsyncGenerator(parameters)) {
      fetch(`${requestOptions.url}/__agrume_send_stream`, {
        body: new ReadableStream({
          async start(controller) {
            while (true) {
              const { done, value } = await parameters.next()

              const YIELD_PREFIX = 'YIELD'
              const RETURN_PREFIX = 'RETURN'

              if (done) {
                if (value !== undefined) {
                  controller.enqueue(`${RETURN_PREFIX}${JSON.stringify(value)}`)
                }

                controller.close()
                return
              }

              controller.enqueue(`${YIELD_PREFIX}${JSON.stringify(value)}`)
            }
          },
        }),
        // @ts-expect-error `duplex` is correct
        duplex: 'half',
        headers: {
          ...requestOptions.headers,
          'Content-Type': 'application/octet-stream',
          'X-Agrume-Rid-Stream': agrumeRid,
        },
        method: 'POST',
      })
    }

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
