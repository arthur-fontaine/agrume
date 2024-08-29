import { describe, expect, it } from 'vitest'
import { inject } from 'light-my-request'
import { loadAgrumeProject } from './utils/load-agrume-project'

describe('`createRoute` that throws an HTTP error', () => {
  it('should work', async () => {
    const API_PATH = '/hello-error'

    const { close, server } = await loadAgrumeProject(/* tsx */`
      import React from 'react'
      import { createRoute, HTTPError } from 'agrume'

      const r = createRoute(async () => {
        throw HTTPError.ImATeapot('Hello Error')
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

    expect(response.statusCode).toBe(418)
    expect(response.statusMessage).toBe('Hello Error')
  })
})
