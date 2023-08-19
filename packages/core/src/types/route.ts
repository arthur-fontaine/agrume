import type { JsonValue, ReadonlyDeep } from "type-fest"

export type Route<RT extends Promise<JsonValue> = Promise<JsonValue>> = (
  // eslint-disable-next-line functional/prefer-immutable-types
  (parameters: ReadonlyDeep<JsonValue>, node: typeof globalThis) => RT
)

export type ReturnedRoute<R extends Route> = (
  (parameters?: Parameters<R>[0]) => Promise<Awaited<ReturnType<R>>>
)
