import type { RequestOptions } from './request-options'

export type GlobalOptions = {
  getClient?: (
    | (
      (requestOptions: RequestOptions) => (...parameters: unknown[]) => unknown
    )
    | undefined
  )
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
      | { accessToken: string, domain: string, type: 'pinggy' }
      | { accessToken?: never, domain: string, type: 'ngrok' }
      | { accessToken?: never, domain?: never, type: 'bore' }
      | { accessToken?: never, domain?: never, type: 'localtunnel' }
    )
  }
  )
