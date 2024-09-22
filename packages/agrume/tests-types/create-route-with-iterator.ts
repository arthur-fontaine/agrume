import { expectTypeOf } from 'vitest'
import { createRoute } from '../src/agrume'

const route = createRoute(async function* () {
  yield 'Hello World' as const
}, { path: '/hello' })

expectTypeOf(route).toEqualTypeOf<() => Promise<AsyncGenerator<'Hello World', void, unknown>>>()
