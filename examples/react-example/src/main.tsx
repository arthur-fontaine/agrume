import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './app.tsx'

// eslint-disable-next-line functional/no-conditional-statements
if (typeof document !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  void ReactDOM.createRoot(document.querySelector('#root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
