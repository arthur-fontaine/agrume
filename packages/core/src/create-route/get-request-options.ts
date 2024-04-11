import type { RequestOptions } from '@agrume/types'

/**
 * Get the request options.
 * @param {string} url The URL.
 * @returns {RequestOptions} The request options.
 */
export function getRequestOptions(url: string): RequestOptions {
  return {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    url,
  }
}
