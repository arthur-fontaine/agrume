import { describe, expect, it } from 'vitest'
import { inject } from 'light-my-request'
import { loadAgrumeProject } from './utils/load-agrume-project'

describe('`prefix` option in plugin', () => {
  it('should work', async () => {
    const EXPECTED_RETURN = 'Hello World'
    const API_PATH = '/hello'
    const PREFIX = `/${Math.random().toString(36).substring(7)}/` as const

    const { close, server } = await loadAgrumeProject(/* tsx */`
      import React from 'react'
      import { createRoute } from 'agrume'
      
      const r = createRoute(async () => '${EXPECTED_RETURN}', { path: '${API_PATH}' })
      
      export function App() {
        return null
      }
    `, {
      prefix: PREFIX,
    })

    const response = await inject(server, {
      method: 'POST',
      url: `${PREFIX}${API_PATH.replace(/^\//, '')}`,
    })
    await close()

    expect(response.statusCode).toBe(200)
    expect(response.json<string>()).toBe(EXPECTED_RETURN)
  })
})
