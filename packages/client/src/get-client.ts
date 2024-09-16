import type { AnyRoute, DefaultClient, RequestOptions } from '@agrume/types'

/**
 * Gets the default client.
 * @param {RequestOptions} requestOptions The request options.
 * @returns {DefaultClient} The default client.
 */
export function getClient<R extends AnyRoute>(
  requestOptions: RequestOptions,
): DefaultClient<R> {
  return async function (parameters: Parameters<R>[0]) {
    const response = await fetch(requestOptions.url, {
      ...requestOptions,
      body: JSON.stringify(parameters),
    })

    if (response.headers.get('content-type')?.includes('application/json')) {
      return response.json()
    }

    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      const getAsyncGenerator = async function* () {
        const reader = response
          .body
          ?.pipeThrough(new TextDecoderStream())
          .getReader()

        if (reader === undefined) {
          return
        }

        while (true) {
          const { done, value: unformattedValue } = await reader.read()

          if (done) {
            return
          }

          const unformattedValues = unformattedValue.split('\n\n')

          for (const unformattedValue of unformattedValues) {
            if (unformattedValue === '') {
              continue
            }

            const DATA_PREFIX = 'data: '
            const data = unformattedValue.startsWith(DATA_PREFIX)
              ? unformattedValue.slice(DATA_PREFIX.length)
              : unformattedValue

            if (data === 'DONE') {
              return
            }

            const RETURN_PREFIX = 'RETURN'
            if (data.startsWith(RETURN_PREFIX)) {
              return JSON.parse(data.slice(RETURN_PREFIX.length))
            }

            yield JSON.parse(data)
          }
        }
      }

      return getAsyncGenerator()
    }
  } as never
}
