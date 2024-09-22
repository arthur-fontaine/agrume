import type { RequestOptions } from './request-options'

import type { AnyRoute } from './route'

// eslint-disable-next-line ts/no-explicit-any
type AnyRouteOptions = RouteOptions<AnyRoute, any>

/**
 * @internal
 * @example How to implement a `createRoute` function
 * ```ts
 * import type { CreateRoute } from '@agrume/types'
 *
 * function createRoute<R extends AnyRoute, C = undefined>(
 *   ...[route, options]: Parameters<CreateRoute<R, C>>
 * ): ReturnType<CreateRoute<R, C>> {
 *   // ...
 * }
 * ```
 */
export interface CreateRoute<
  R extends AnyRoute,
  O extends AnyRouteOptions | undefined,
> {
  (route: R, options?: O): RouteReturnValue<R, O>
}

const routeTypesSymbol = Symbol('routeTypes')

export interface RouteTypes<R extends AnyRoute> {
  [routeTypesSymbol]?: {
    parameters: Parameters<R>
    returnType: ReturnType<R>
  }
}

export type InferRouteParameters<R extends RouteTypes<AnyRoute> | undefined>
  = NonNullable<NonNullable<R>[typeof routeTypesSymbol]>['parameters']
export type InferRouteReturnType<R extends RouteTypes<AnyRoute> | undefined>
  = NonNullable<NonNullable<R>[typeof routeTypesSymbol]>['returnType']

type GetClient<R extends AnyRoute, C>
  = (
    requestOptions: RequestOptions,
    _routeTypes?: RouteTypes<R>,
  ) => C extends undefined
    ? ((...parameters: Parameters<R>) => unknown)
    : C

export interface RouteOptions<R extends AnyRoute, C = undefined> {
  getClient?: GetClient<R, C>
  path?: `/${string}`
}

// @ts-expect-error R should not be removed
// eslint-disable-next-line unused-imports/no-unused-vars
export interface CustomClient<R extends AnyRoute> {
}

const impossibleTypeSymbol = Symbol('Impossible type')
type ImpossibleType<T> = T & {
  [impossibleTypeSymbol]: typeof impossibleTypeSymbol
}

type RouteReturnValue<R extends AnyRoute, O extends AnyRouteOptions | undefined>
  = (
    CustomClient<R> extends { getClient: unknown }
      // If there is a client configured globally
      ? O extends undefined
        // If there is no options configured locally
        ? CustomClient<R>['getClient'] extends GetClient<R, infer GlobalClient>
          // If the client configured globally is valid
          ? GlobalClient // Return the client configured globally
          // If the client configured globally is invalid
          : ImpossibleType<'The client configured globally is invalid. Refer to the documentation for more information.'>
        // If there are options configured locally
        : NonNullable<O> extends { getClient: GetClient<R, infer LocalClient> }
          // If the client configured locally is valid
          ? LocalClient // Return the client configured locally
          // If the client configured locally is invalid
          : ImpossibleType<'The client configured locally is invalid. Refer to the documentation for more information.'>
      // If there is no client configured globally
      : O extends undefined
        // If there is no options configured locally
        ? DefaultClient<R> // Return the default client
        // If there are options configured locally
        : NonNullable<O> extends { getClient: GetClient<R, infer LocalClient> }
          // If the client configured locally is valid
          ? LocalClient // Return the client configured locally
          // If the client configured locally is invalid
          : ImpossibleType<'The client configured locally is invalid. Refer to the documentation for more information.'>
  )

type FlattenPromise<T> = T extends Promise<infer U>
  ? FlattenPromise<U>
  : Promise<T>

export type DefaultClient<R extends AnyRoute>
  = (...parameters: Parameters<R>) => ReturnType<R> extends Generator<
    infer GeneratorT,
    infer GeneratorReturn,
    infer GeneratorNext
  >
    ? Promise<AsyncGenerator<GeneratorT, GeneratorReturn, GeneratorNext>>
    : ReturnType<R> extends AsyncGenerator
      ? Promise<ReturnType<R>>
      : FlattenPromise<ReturnType<R>>
