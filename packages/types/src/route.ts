import type { JsonValue } from 'type-fest'

/**
 * @internal
 */
export type RouteParameters =
  | AsyncGenerator<Readonly<JsonValue>, Readonly<JsonValue> | void, undefined>
  | Readonly<JsonValue>

/**
 * @internal
 */
export type RouteReturnValue =
  AsyncGenerator<JsonValue, JsonValue | void, undefined> |
  Generator<JsonValue, JsonValue | void, undefined> |
  Promise<JsonValue>

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
export type AnyRoute<RRV extends RouteReturnValue = any>
  = Route<RouteParameters, RRV>
