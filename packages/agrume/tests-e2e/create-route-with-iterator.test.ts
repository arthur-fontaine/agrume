import { describe, expect, it } from 'vitest'
import { inject } from 'light-my-request'
import { loadAgrumeProject } from './utils/load-agrume-project'
import { formatStreamData } from './utils/format-stream-data'

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

    const { close, server } = await loadAgrumeProject(/* tsx */`
      import React from 'react'
      import { createRoute } from 'agrume'
      
      const r = createRoute(async function* () {
        const messages = ${JSON.stringify(EXPECTED_RETURNS)}
        for (const i in messages) {
          if (i === messages.length - 1) {
            return messages[i]
          }
          yield messages[i]
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
})
