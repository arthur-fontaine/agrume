import type { JsonValue } from "type-fest"

export type RouteParameters = Readonly<JsonValue>
export type RouteReturnValue = Promise<JsonValue>

export type Route<
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _RouteParameters extends RouteParameters = null,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  _RouteReturnValue extends RouteReturnValue = Promise<JsonValue>,
> = (
  // eslint-disable-next-line functional/prefer-immutable-types
  (parameters: _RouteParameters) => _RouteReturnValue
)
