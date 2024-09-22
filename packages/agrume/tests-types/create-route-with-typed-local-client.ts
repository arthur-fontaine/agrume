import { expectTypeOf } from 'vitest'
import { createRoute } from '../src/agrume'

const route = createRoute(
  async (_p: number) => 'Hello world' as const,
  {
    getClient: (_ro, _) => {
      type RP = createRoute.Helpers.InferRouteTypes.Parameters<typeof _>
      type RT = createRoute.Helpers.InferRouteTypes.ReturnType<typeof _>
      return (..._parameters: RP) => ({}) as RT
    },
    path: '/hello',
  },
)

expectTypeOf(route).toEqualTypeOf<(p: number) => Promise<'Hello world'>>()
