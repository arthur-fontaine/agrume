import { describe, expect, it } from 'vitest'
import { inject } from 'light-my-request'
import { loadAgrumeProject } from './utils/load-agrume-project'

describe('simplest usage of `createRoute`', () => {
  it('should work', async () => {
    const EXPECTED_RETURN = 'Hello World'
    const API_PATH = '/hello'

    const { close, server } = await loadAgrumeProject(/* tsx */`
      import React from 'react'
      import { createRoute } from 'agrume'
      
      const r = createRoute(async () => '${EXPECTED_RETURN}', { path: '${API_PATH}' })
      
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
    expect(response.json<string>()).toBe(EXPECTED_RETURN)
  })
})