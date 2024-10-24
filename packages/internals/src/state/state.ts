import type { AnyRoute, GlobalOptions } from '@agrume/types'

interface State {
  isRegistering: boolean
  isServerPaused: boolean
  options: GlobalOptions
  routes: Map<string, AnyRoute>
}

export const state = {
  get: getState,
  set: setState,
}

const store: State = {
  isRegistering: false,
  isServerPaused: false,
  options: {},
  routes: new Map(),
}

function getState() {
  return store
}

function setState(setter: (state: State) => State) {
  const newState = setter(store)
  Object.assign(store, newState)
}
