import type { GlobalOptions, Route } from '@agrume/types'

interface State {
  isRegistering: boolean
  options: GlobalOptions
  routes: Map<string, Route>
}

export const state = {
  get: getState,
  set: setState,
}

const store: State = {
  isRegistering: false,
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
