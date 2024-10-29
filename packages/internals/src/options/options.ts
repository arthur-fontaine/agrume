// @ts-expect-error Tunnel import is required to prevent "Not portable" error
// eslint-disable-next-line unused-imports/no-unused-imports
import type { Tunnel } from '@agrume/tunnel'
import type { GlobalOptions } from '@agrume/types'
import defu from 'defu'
import { state } from '../state/state'

const defaultOptions: Required<GlobalOptions> = {
  baseUrl: '/',
  getClient: undefined,
  logger: undefined,
  prefix: '/api/',
  tunnel: undefined,
}

setOptions(defaultOptions)

export const options = {
  get: getOptions,
  set: setOptions,
}

/**
 * Get the options.
 * @returns {GlobalOptions} The options.
 */
function getOptions() {
  return defu(state.get()?.options ?? {}, defaultOptions)
}

/**
 * Set the options.
 * @param {GlobalOptions} options The options.
 * @internal
 */
function setOptions(options: GlobalOptions) {
  state.set((state) => {
    state.options = defu(options, state.options) as GlobalOptions
    return state
  })
}
