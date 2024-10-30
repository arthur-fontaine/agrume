/* eslint-disable filename-export/match-named-export */
/* eslint-disable filename-rules/not-match */

export interface Builder {
  (options: BuilderOptions): Generator<
    { content: string, filename: string },
    void,
    unknown
  >
}

export interface BuilderOptions {
  enableLogger?: boolean | undefined
  listen?: number | undefined
  singleFile?: boolean | undefined
}
