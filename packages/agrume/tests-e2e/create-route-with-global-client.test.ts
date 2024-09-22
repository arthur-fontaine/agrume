import { beforeEach, describe, expect, it } from 'vitest'
import getPort from 'get-port'
import { getOptimizedClient } from '../../client/dist/optimized/get-optimized-client'
import { transformAgrume } from './utils/transform-agrume'
import { loadAgrumeProject } from './utils/load-agrume-project'

beforeEach(() => {
  globalThis.__agrumeClient = undefined
  if (globalThis.__agrumeClient !== undefined) {
    // eslint-disable-next-line fp/no-throw
    throw new Error('The global client was not reset.')
  }
})

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

  it.sequential('should work with `@agrume/client/optimized`', async () => {
    const API_PATH = '/hello-optimized-client'
    const EXPECTED_RETURN = 'Hello World'
    const PORT = await getPort()

    const code = /* tsx */`
      import { createRoute } from 'agrume'
      import '@agrume/client/optimized/register'

      export const client = createRoute(async () => {
        return "${EXPECTED_RETURN}"
      }, { path: '${API_PATH}' })
    `

    const { close, server } = await loadAgrumeProject(/* tsx */`
      ${code}
      export function App() {
        return null
      }
    `, {
      getClient: getOptimizedClient(),
    })
    const { run } = await transformAgrume(code, {
      baseUrl: `http://localhost:${PORT}/`,
      getClient: getOptimizedClient(),
    })
    const { client } = await run() as {
      client: () => Promise<string>
    }

    server.listen(PORT)

    const response = await client()

    expect(response).toBe(EXPECTED_RETURN)

    await close()
  })

  it.sequential('should not work with `@agrume/client/optimized` if the client is not registered', async () => {
    const API_PATH = '/hello-optimized-client-not-registered'
    const EXPECTED_RETURN = 'Hello World'
    const PORT = await getPort()

    const code = /* tsx */`
      import { createRoute } from 'agrume'

      export const client = createRoute(async () => {
        return "${EXPECTED_RETURN}"
      }, { path: '${API_PATH}' })
    `

    // Unregister the global client for the next tests
    globalThis.__agrumeClient = undefined
    if (globalThis.__agrumeClient !== undefined) {
      // eslint-disable-next-line fp/no-throw
      throw new Error('The global client was not reset.')
    }
    const { close, server } = await loadAgrumeProject(/* tsx */`
      ${code}
      export function App() {
        return null
      }
    `, {
      getClient: getOptimizedClient(),
    })
    const { run } = await transformAgrume(code, {
      baseUrl: `http://localhost:${PORT}/`,
      getClient: getOptimizedClient(),
    })

    const { client } = await run() as {
      client: () => Promise<string>
    }

    server.listen(PORT)

    // eslint-disable-next-line no-async-promise-executor
    await expect(() => new Promise<void>(async (resolve, reject) => {
      try {
        await client()
        resolve()
      }
      catch (error) {
        reject(error)
      }
    })).rejects.toThrow('globalThis.__agrumeClient is not a function')

    await close()
  })
})
