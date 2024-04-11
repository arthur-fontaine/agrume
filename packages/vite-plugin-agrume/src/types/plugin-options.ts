import type { GlobalOptions } from '@agrume/types'
import type { Connect } from 'vite'

export interface PluginOptions extends GlobalOptions {
  useMiddleware?: (middleware: Connect.NextHandleFunction) => void
}
