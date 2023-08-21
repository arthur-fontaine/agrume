import React, { useEffect } from 'react'

import { Dog } from './dog'

/**
 * @returns The root component of the application.
 */
export function App() {
  useEffect(function () {
    const oldFetch = window.fetch
    // eslint-disable-next-line max-len
    // eslint-disable-next-line functional/no-expression-statements, functional/immutable-data, functional/prefer-immutable-types, @typescript-eslint/no-explicit-any
    window.fetch = function (url: unknown, ...arguments_: any[]) {
      return oldFetch(`http://localhost:1000${url}`, ...arguments_)
    }

    return undefined
  }, [])

  return (
    <>
      <Dog />
    </>
  )
}
