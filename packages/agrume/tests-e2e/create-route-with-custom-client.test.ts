import { describe, expect, it } from 'vitest'
import { transformAgrume } from './utils/transform-agrume'

describe('`createRoute` with custom client', () => {
  it('should work', async () => {
    const API_PATH = '/hello-custom-client'
    const EXPECTED_RETURN = 'Hello World'

    const { run } = await transformAgrume(/* tsx */`
      import { createRoute } from 'agrume'

      export const client = createRoute(async () => {
        return "BAD ${EXPECTED_RETURN}"
      }, {
        path: '${API_PATH}',
        getClient(requestOptions) {
          return async (parameters) => {
            return "${EXPECTED_RETURN}"
          }
        },
      })
    `)

    const { client } = await run() as { client: () => Promise<unknown> }
    expect(await client()).toBe(EXPECTED_RETURN)
  })
})
