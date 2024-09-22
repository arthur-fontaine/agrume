import { getClient } from '../get-client'

declare global {
  // eslint-disable-next-line vars-on-top, no-var -- This is needed to type globalThis.
  var __agrumeClient: typeof getClient
}

globalThis.__agrumeClient = getClient
