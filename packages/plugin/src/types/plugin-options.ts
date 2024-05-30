import type { GlobalOptions } from '@agrume/types'
import type { Connect } from 'vite'

export type PluginOptions = GlobalOptions & {
  useMiddleware?: (middleware: Connect.NextHandleFunction) => void
}
