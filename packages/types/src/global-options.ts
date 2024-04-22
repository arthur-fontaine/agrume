export interface GlobalOptions {
  baseUrl?: `${string}/`
  logger?: {
    error?: typeof console.error
    info?: typeof console.info
  } | undefined
  prefix?: '/' | `/${string}/`
}
