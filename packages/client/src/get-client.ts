import type { AnyRoute, DefaultClient, RequestOptions } from '@agrume/types'

/**
 * Gets the default client.
 * @param {RequestOptions} requestOptions The request options.
 * @returns {DefaultClient} The default client.
 */
export function getClient<R extends AnyRoute>(
  requestOptions: RequestOptions,
): DefaultClient<R> {
  function isAsyncGenerator<T, R, N>(
    // eslint-disable-next-line ts/no-explicit-any
    value: any,
  ): value is AsyncGenerator<T, R, N> {
    if (!value) {
      return false
    }

    if (Symbol.asyncIterator !== undefined) {
      const asyncGenerator
        = (async function* () { yield undefined }()).constructor

      return value.constructor.constructor === asyncGenerator.constructor
    }
    else {
      // This is a fallback. For example, the polyfill used in Expo does not
      // have a "normal" behavior.
      // `asyncGenerator` will be `AsyncGenerator` instead of `AsyncGeneratorFunction`.
      // Then, the constructor of the constructor will be `Function` instead of `AsyncGenerator`.
      // So, in environments where `Symbol.asyncIterator` is not defined (where
      // async generators are not natively supported), we fallback to this less
      // reliable method.
      return value.constructor.name.startsWith('AsyncGenerator')
    }
  }

  return async function (parameters: Parameters<R>[0]) {
    const agrumeRid = crypto.randomUUID()

    const response = await fetch(requestOptions.url, {
      ...requestOptions,
      ...(!isAsyncGenerator(parameters) && {
        body: JSON.stringify(parameters),
      }),
      headers: {
        ...requestOptions.headers,
        ...(isAsyncGenerator(parameters) && {
          'X-Agrume-Rid-Stream': agrumeRid,
        }),
      },
    })

    if (isAsyncGenerator(parameters)) {
      fetch(`${requestOptions.url}/__agrume_send_stream`, {
        body: new ReadableStream({
          async start(controller) {
            while (true) {
              const { done, value } = await parameters.next()

              const YIELD_PREFIX = 'YIELD'
              const RETURN_PREFIX = 'RETURN'

              if (done) {
                if (value !== undefined) {
                  controller.enqueue(`${RETURN_PREFIX}${JSON.stringify(value)}`)
                }

                controller.close()
                return
              }

              controller.enqueue(`${YIELD_PREFIX}${JSON.stringify(value)}`)
            }
          },
        }),
        // @ts-expect-error `duplex` is correct
        duplex: 'half',
        headers: {
          ...requestOptions.headers,
          'Content-Type': 'application/octet-stream',
          'X-Agrume-Rid-Stream': agrumeRid,
        },
        method: 'POST',
      })
    }

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
