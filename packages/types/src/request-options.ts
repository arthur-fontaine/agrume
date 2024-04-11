/**
 * Options used on individual requests.
 * @example
 * ```ts
 * createRoute(() => '', { /* RequestOptions * / })
 * ```
 * @internal
 */
export interface RequestOptions {
  headers: Record<string, string>
  method: 'POST'
  url: string
}
