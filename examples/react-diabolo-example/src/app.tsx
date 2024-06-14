import { createRoute } from 'agrume'
import React, { useEffect, useState } from 'react'

import * as DI from 'diabolo'
import { routeService, routeServiceImpl } from './route-service'

const r = createRoute(
  DI.provide(DI.createFunction(function* (txt: string) {
    const { route } = yield * DI.requireService(routeService)
    return route(txt)
  }), {
    RouteService: routeServiceImpl,
  }),
)

/**
 * The app.
 * @returns {any} The app.
 */
export const App = function () {
  const [response, setResponse] = useState<string>('')
  useEffect(() => {
    r('Hello, world!').then(setResponse)
  }, [])

  return (
    <div>
      {response}
    </div>
  )
}
