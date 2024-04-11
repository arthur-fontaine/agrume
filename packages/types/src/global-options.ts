export interface GlobalOptions {
  logger?: {
    error?: typeof console.error
    info?: typeof console.info
  } | undefined
  prefix?: `/${string}/`
}
