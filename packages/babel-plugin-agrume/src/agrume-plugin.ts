import { declare } from '@babel/helper-plugin-utils'
import { state } from '@agrume/internals'
import type { GlobalOptions } from '@agrume/types'
import defu from 'defu'

import packageJson from '../package.json'
import { transformCallExpression } from './transforms/transform-call-expression'

export const agrumePlugin = declare<GlobalOptions>((_api, options) => {
  state.set((state) => {
    state.options = defu(options, state.options) as GlobalOptions
    return state
  })

  return {
    name: packageJson.name,
    visitor: {
      CallExpression: transformCallExpression,
      Program: {
        enter() {
          state.set((state) => {
            state.isRegistering = true
            return state
          })
        },
        exit() {
          state.set((state) => {
            state.isRegistering = false
            return state
          })
        },
      },
    },
  }
})
