/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */

import type Connect from "connect"

import { state } from "./state"

export interface AgrumeOptions {
  server?: Connect.Server | undefined
  prefix?: `/${string}/`
  logger?: {
    info?: typeof console.info
    error?: typeof console.error
  } | undefined
}

const default_options: Required<AgrumeOptions> = {
  server: undefined,
  prefix: "/api/",
  logger: undefined,
}

/**
 * @returns The options.
 */
export function getAgrumeOptions(): Required<AgrumeOptions> {
  return { ...default_options, ...state.options }
}

/**
 * @param options The options.
 * @returns The new options.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function setAgrumeOptions(options: AgrumeOptions): AgrumeOptions {
  state.options = options
  return state.options
}
