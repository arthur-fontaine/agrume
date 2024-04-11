import type { JsonValue } from 'type-fest'

/**
 * @internal
 */
export type RouteParameters = Readonly<JsonValue>

/**
 * @internal
 */
export type RouteReturnValue =
  AsyncGenerator<JsonValue, JsonValue | void, JsonValue> |
  Generator<JsonValue, JsonValue | void, JsonValue> |
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
export type AnyRoute<RRV extends RouteReturnValue = any> = Route<any, RRV>
