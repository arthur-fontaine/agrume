import { describe, expect, it } from 'vitest'
import { transformAgrume } from './utils/transform-agrume'

describe('`createRoute` with global client', () => {
  it('should work', async () => {
    const API_PATH = '/hello-global-client'
    const EXPECTED_RETURN = 'Hello World'

    const { run } = await transformAgrume(/* tsx */`
      import { createRoute } from 'agrume'

      export const client = createRoute(async () => {
        return "BAD ${EXPECTED_RETURN}"
      }, {
        path: '${API_PATH}',
      })
    `, {
      // eslint-disable-next-line no-new-func
      getClient: new Function(`
        return async () => {
          return '${EXPECTED_RETURN}'
        }
      `) as never,
    })

    const { client } = await run() as { client: () => Promise<unknown> }
    expect(await client()).toBe(EXPECTED_RETURN)
  })
})
