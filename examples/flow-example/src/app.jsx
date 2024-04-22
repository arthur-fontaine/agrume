// @flow

import React from 'react'
import { createRoute } from 'agrume'

const hello = createRoute(async () => 'Hello, world!')

type TextProps = {
  +length: number;
}

const App = (props: TextProps): React$Node => {
  const [text, setText] = React.useState()

  React.useEffect(() => {
    hello().then(setText)
  }, [])

  return <div>
    <header>
      <h1>Hello from Vite + React + Flow</h1>
      <p>{text}</p>
    </header>
  </div>
}

export default App
