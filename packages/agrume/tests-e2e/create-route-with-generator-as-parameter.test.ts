import { describe, expect, it } from 'vitest'
import getPort from 'get-port'
import { loadAgrumeProject } from './utils/load-agrume-project'
import { transformAgrume } from './utils/transform-agrume'

describe('passing a generator as parameter to `createRoute`', () => {
  it('should work', async () => {
    const API_PATH = '/hello-stream'
    const EXPECTED_RETURNS = ['Hello', 'World', 'Agrume']
    const SENDING_INTERVAL = 200
    const PREFIX_FROM_SERVER = `${Math.random().toString(36).slice(2)}:`
    const PORT = await getPort()

    const code = /* tsx */`
      import { createRoute } from 'agrume'
      
      export const r = createRoute(async function* (iterator) {
        for await (const value of iterator) {
          yield "${PREFIX_FROM_SERVER}" + value
        }
      }, { path: '${API_PATH}' })
    `

    const { close, server } = await loadAgrumeProject(/* tsx */`
      ${code}

      export function App() {
        return null
      }
    `)
    const { run } = await transformAgrume(code, {
      baseUrl: `http://localhost:${PORT}/`,
    })
    const { r: client } = await run() as {
      r: (iterator: AsyncGenerator<string>)
      => Promise<AsyncGenerator<string, void, undefined>>
    }

    server.listen(PORT)

    let lastValue: string | undefined
    const response = await client((async function* () {
      await wait(SENDING_INTERVAL) // Initial delay
      for (const expectedReturn of EXPECTED_RETURNS) {
        yield expectedReturn
        await wait(SENDING_INTERVAL) // Ensure the server has time to process the value
        expect(lastValue).toBe(`${PREFIX_FROM_SERVER}${expectedReturn}`)
      }
    }()));

    (async () => {
      for await (const value of response) {
        lastValue = value
      }
    })()

    await wait(SENDING_INTERVAL * EXPECTED_RETURNS.length + 1000)
    await close()
  }, { timeout: 10000 })
})

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
