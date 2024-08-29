/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
// @ts-nocheck

import React from 'react'
import ReactDOM from 'react-dom/client'

import { App } from './app.tsx'

if (typeof document !== 'undefined') {
  void ReactDOM.createRoot(document.querySelector('#root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
}
