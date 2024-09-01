import { describe, expect, it } from 'vitest'
import getPort from 'get-port'
import { loadAgrumeProject } from './utils/load-agrume-project'
import { deferredStream } from './utils/deferred-stream'
import { transformAgrume } from './utils/transform-agrume'

describe('passing a stream as parameter to `createRoute`', () => {
  it('should work', async () => {
    const API_PATH = '/hello-stream'
    const EXPECTED_RETURNS = ['Hello', 'World', 'Agrume']
    const SENDING_INTERVAL = 200
    const PREFIX_FROM_SERVER = `${Math.random().toString(36).slice(2)}:`
    const PORT = await getPort()

    const code = /* tsx */`
      import { createRoute } from 'agrume'
      
      export const r = createRoute(async function* (stream) {
        const reader = stream.getReader()

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            return
          }

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
      r: (stream: ReadableStream<Uint8Array>)
      => Promise<AsyncGenerator<string, void, undefined>>
    }

    server.listen(PORT)

    const { closeStream, sendData, stream } = deferredStream()
    let lastValue: string | undefined
    setTimeout(async () => {
      for (const expectedReturn of EXPECTED_RETURNS) {
        sendData(expectedReturn)
        await wait(SENDING_INTERVAL)
        expect(lastValue).toBe(`${PREFIX_FROM_SERVER}${expectedReturn}`)
      }

      closeStream()
    }, SENDING_INTERVAL)

    const response = await client(stream.pipeThrough(new TextEncoderStream()))
    await close();

    (async () => {
      for await (const value of response) {
        lastValue = value
      }
    })()

    await wait(SENDING_INTERVAL * EXPECTED_RETURNS.length + 1000)
  })
})

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
