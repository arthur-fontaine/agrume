import { state } from '@agrume/internals'
import type { GlobalOptions } from '@agrume/types'
import defu from 'defu'

const defaultOptions: Required<GlobalOptions> = {
  baseUrl: '/',
  logger: undefined,
  prefix: '/api/',
}

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
    state.options = defu(options, state.options)
    return state
  })
}
