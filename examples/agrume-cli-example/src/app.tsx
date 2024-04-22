import React from 'react'
import { createRoute } from 'agrume'

const hello = createRoute(async () => 'Hello, world!')

/**
 * The app.
 * @returns {React.ReactElement} The app.
 */
export function App() {
  const [message, setMessage] = React.useState<null | string>(null)
  React.useEffect(() => {
    hello().then(setMessage)
  }, [])

  return <div>{message}</div>
}
