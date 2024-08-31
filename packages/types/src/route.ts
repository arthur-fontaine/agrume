import type { JsonValue } from 'type-fest'

/**
 * @internal
 */
export type RouteParameters = Readonly<JsonValue>

type RouteValue = JsonValue | undefined | void

/**
 * @internal
 */
export type RouteReturnValue =
  AsyncGenerator<RouteValue, RouteValue | void, undefined> |
  Generator<RouteValue, RouteValue | void, undefined> |
  Promise<RouteValue>

/**
 * @internal
 */
export type Route<
  RP extends RouteParameters = null,
  RRV extends RouteReturnValue = RouteReturnValue,
> = (parameters: RP) => RRV

/**
 * @internal
 */
// eslint-disable-next-line ts/no-explicit-any
export type AnyRoute<RRV extends RouteReturnValue = any> = Route<any, RRV>
