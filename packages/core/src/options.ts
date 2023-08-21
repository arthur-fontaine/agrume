/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-expression-statements */

import type Connect from "connect"

import { state } from "./state"

export interface AgrumeOptions {
  server?: Connect.Server | undefined
  prefix?: `/${string}/`
}

const default_options: Required<AgrumeOptions> = {
  server: undefined,
  prefix: "/api/",
}

/**
 * @returns The options.
 */
export function getOptions(): Required<AgrumeOptions> {
  return { ...default_options, ...state.options }
}

/**
 * @param options The options.
 * @returns The new options.
 */
// eslint-disable-next-line functional/prefer-immutable-types
export function setOptions(options: AgrumeOptions): AgrumeOptions {
  state.options = options
  return state.options
}
