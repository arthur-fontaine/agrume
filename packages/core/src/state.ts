import { AgrumeOptions } from "./options"
import { Route } from "./types/route"

const state = {
  isRegistering: false,
  routes: new Map<string, Route>(),
  options: {} satisfies AgrumeOptions,
}

export { state }
