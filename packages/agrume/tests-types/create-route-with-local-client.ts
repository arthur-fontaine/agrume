import { expectTypeOf } from 'vitest'
import { createRoute } from '../src/agrume'

const route = createRoute(async () => '', {
  getClient: () => () => {
    return 'Hello World 2' as const
  },
  path: '/hello',
})

expectTypeOf(route).toEqualTypeOf<() => 'Hello World 2'>()

const _invalidRoute = createRoute(async () => 0, {
  // @ts-expect-error This is what we are testing
  getClient: 'Hello World 2',
  path: '/hello',
})
