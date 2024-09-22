import { describe, expect, it } from 'vitest'
import { inject } from 'light-my-request'
import getPort from 'get-port'
import { loadAgrumeProject } from './utils/load-agrume-project'
import { formatStreamData } from './utils/format-stream-data'
import { transformAgrume } from './utils/transform-agrume'

describe('`createRoute` with iterator function', () => {
  it('should work', async () => {
    const EXPECTED_RETURNS = ['Hello World', 'Hello World 2', 'Hello World 3']
    const API_PATH = '/hello-iterator'

    const { close, server } = await loadAgrumeProject(/* tsx */`
      import React from 'react'
      import { createRoute } from 'agrume'
      
      const r = createRoute(async function* () {
        const messages = ${JSON.stringify(EXPECTED_RETURNS)}
        for (const message of messages) {
          yield message
        }
      }, { path: '${API_PATH}' })
      
      export function App() {
        return null
      }
    `)

    const response = await inject(server, {
      method: 'POST',
      url: `/api${API_PATH}`,
    })
    await close()

    expect(response.statusCode).toBe(200)
    expect(response.headers['content-type']).toBe('text/event-stream')

    const data: string[] = []
    const body = response.stream()
    body.on('data', (chunk) => {
      data.push(...formatStreamData(chunk.toString()))
    })
    await new Promise(resolve => body.on('end', resolve))
    expect(data).toEqual(EXPECTED_RETURNS)
  })

  it('should work with a return value', async () => {
    const EXPECTED_RETURNS = ['Hello World', 'Hello World 2', 'Hello World 3', 'Bye World']
    const API_PATH = '/hello-iterator-return'
    const PORT = await getPort()

    const code = /* tsx */`
      import { createRoute } from 'agrume'
      
      export const r = createRoute(async function* () {
        const messages = ${JSON.stringify(EXPECTED_RETURNS)}
        for (const _i in messages) {
          const i = Number(_i)
          if (i === messages.length - 1) {
            return messages[i]
          }
          yield messages[i]
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
      r: () => Promise<AsyncGenerator<string, string, undefined>>
    }

    server.listen(PORT)

    const response = await client()

    for await (const value of response) {
      expect(value).toBe(EXPECTED_RETURNS.shift())
    }
    expect(EXPECTED_RETURNS).toHaveLength(1) // As for-await doesn't take in account the return value of an async generator, the last value (being a return value and not a yield value) had not been "shifted" in the loop and should still be in the array. If it's not, it means that the value that should be the return value has been yielded instead.

    await close()
  })
})
