import type { GlobalOptions } from './global-options'
import type { PluginOptions } from './plugin-options'

export type CliOptions = {
  corsRegex?: RegExp | string | undefined
  host?: string | undefined
  port?: number | undefined
  prefix?: PluginOptions['prefix'] | undefined
  watch?: boolean | undefined
} & (
  | { externalUrl?: GlobalOptions['baseUrl'], tunnel?: never | undefined }
  | { externalUrl?: never | undefined, tunnel: GlobalOptions['tunnel'] }
  )
