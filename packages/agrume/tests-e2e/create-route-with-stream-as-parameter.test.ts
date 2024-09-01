import { describe, expect, it } from 'vitest'
import getPort from 'get-port'
import { loadAgrumeProject } from './utils/load-agrume-project'

describe('passing a stream as parameter to `createRoute`', () => {
  it('should work', async () => {
    const API_PATH = '/hello-stream'
    const EXPECTED_RETURNS = ['Hello', 'World', 'Agrume']
    const SENDING_INTERVAL = 200
    const PORT = await getPort()

    const { close, server } = await loadAgrumeProject(/* tsx */`
      import React from 'react'
      import { createRoute } from 'agrume'
      
      const r = createRoute(async function* (stream) {
        const reader = stream.getReader()

        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            return
          }

          yield value
        }
      }, { path: '${API_PATH}' })
      
      export function App() {
        return null
      }
    `)

    server.listen(PORT)

    const stream = new ReadableStream({
      async start(controller) {
        for (const chunk of EXPECTED_RETURNS) {
          await wait(SENDING_INTERVAL)
          controller.enqueue(chunk)
        }
        controller.close()
      },
    }).pipeThrough(new TextEncoderStream())
    const response = await fetch(`http://localhost:${PORT}/api${API_PATH}`, {
      body: stream,
      // @ts-expect-error `duplex` is needed when passing a stream as body
      duplex: 'half',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      method: 'POST',
    })
    await close()

    expect(response.status).toBe(200)
    let lastValue: string | undefined
    response.body
      ?.pipeThrough(new TextDecoderStream())
      .pipeTo(new WritableStream({
        write: (chunk) => { lastValue = chunk.toString() },
      }))

    const INTERVAL_MARGIN = 100
    for (const expectedReturn of EXPECTED_RETURNS) {
      await wait(SENDING_INTERVAL + INTERVAL_MARGIN)
      expect(lastValue).toBe(expectedReturn)
    }
  })
}, { timeout: 20000 })

function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
