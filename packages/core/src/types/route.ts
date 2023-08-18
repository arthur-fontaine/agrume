import type { JsonValue, ReadonlyDeep } from "type-fest"

// eslint-disable-next-line functional/prefer-immutable-types
export type Route = (parameters: ReadonlyDeep<JsonValue>) => JsonValue

export type ReturnedRoute<R extends Route> = (
  (parameters?: Parameters<R>[0]) => Promise<Awaited<ReturnType<R>>>
)
