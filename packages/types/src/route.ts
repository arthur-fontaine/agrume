import type { JsonValue } from 'type-fest'

/**
 * @internal
 */
export type RouteParameters = Readonly<JsonValue>

/**
 * @internal
 */
export type RouteReturnValue = Promise<JsonValue>

/**
 * @internal
 */
export type Route<
  RP extends RouteParameters = null,
  RRV extends RouteReturnValue = Promise<JsonValue>,
> = (parameters: RP) => RRV

/**
 * @internal
 */
// eslint-disable-next-line ts/no-explicit-any
export type AnyRoute<RRV extends RouteReturnValue = any> = Route<any, RRV>
