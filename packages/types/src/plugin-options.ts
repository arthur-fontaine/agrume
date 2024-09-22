import type { Connect } from 'vite'
import type { GlobalOptions } from './global-options'

export type PluginOptions = GlobalOptions & {
  useMiddleware?: (middleware: Connect.NextHandleFunction) => void
}
