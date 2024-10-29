/* eslint-disable filename-export/match-named-export */
/* eslint-disable filename-rules/not-match */

export interface Builder {
  (options: BuilderOptions): Record<string, string>
}

export interface BuilderOptions {
  enableLogger?: boolean | undefined
  listen?: number | undefined
}
