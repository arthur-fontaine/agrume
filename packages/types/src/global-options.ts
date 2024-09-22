import type { RequestOptions } from './request-options'

export type GlobalOptions = {
  getClient?:
  (requestOptions: RequestOptions) => (...parameters: unknown[]) => unknown
  logger?: {
    error?: typeof console.error
    info?: typeof console.info
  } | undefined
  prefix?: '/' | `/${string}/`
} & (
  | {
    baseUrl?: `${string}/`
    tunnel?: never | undefined
  }
  | {
    baseUrl?: never | undefined
    tunnel?: (
      | { type: 'bore' }
      | { type: 'localtunnel' }
    )
  }
)
