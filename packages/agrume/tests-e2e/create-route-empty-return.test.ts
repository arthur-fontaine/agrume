import { describe, expect, it } from 'vitest'
import { inject } from 'light-my-request'
import { loadAgrumeProject } from './utils/load-agrume-project'

describe('empty return in route', () => {
  it('should return 204', async () => {
    const API_PATH = '/hello-empty-return'

    const { close, server } = await loadAgrumeProject(/* tsx */`
      import React from 'react'
      import { createRoute } from 'agrume'
      
      const r = createRoute(async () => {}, { path: '${API_PATH}' })
      
      export function App() {
        return null
      }
    `)

    const response = await inject(server, {
      method: 'POST',
      url: `/api${API_PATH}`,
    })
    await close()

    expect(response.statusCode).toBe(204)
  })
})
