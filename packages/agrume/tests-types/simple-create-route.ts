import { expectTypeOf } from 'vitest'
import { createRoute } from '../src/agrume'

const route = createRoute(async () => 'Hello World' as const, { path: '/hello' })

expectTypeOf(route).toEqualTypeOf<() => Promise<'Hello World'>>()
