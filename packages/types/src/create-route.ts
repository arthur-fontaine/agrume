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

type RouteReturnValue<R extends AnyRoute, O extends AnyRouteOptions | undefined>
  = O extends undefined ? Client<R>
  : NonNullable<O> extends { getClient: (...args: never[]) => void } ? ReturnType<NonNullable<O>['getClient']>
  : Client<R>

type FlattenPromise<T> = T extends Promise<infer U>
  ? FlattenPromise<U>
  : Promise<T>

export type Client<R extends AnyRoute>
  = (...parameters: Parameters<R>) => ReturnType<R> extends Generator<
    infer GeneratorT,
    infer GeneratorReturn,
    infer GeneratorNext
  >
    ? Promise<AsyncGenerator<GeneratorT, GeneratorReturn, GeneratorNext>>
    : ReturnType<R> extends AsyncGenerator
      ? Promise<ReturnType<R>>
      : FlattenPromise<ReturnType<R>>
