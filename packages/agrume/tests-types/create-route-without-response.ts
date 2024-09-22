import { expectTypeOf } from 'vitest'
import { createRoute } from '../src/agrume'

const route = createRoute(async () => {}, { path: '/hello' })

expectTypeOf(route).toEqualTypeOf<() => Promise<void>>()
