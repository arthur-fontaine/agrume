/* eslint-disable filename-export/match-named-export */

import type { AnyRoute, InferRouteParameters, InferRouteReturnType, RouteTypes } from '@agrume/types'
import { createRoute as _createRoute } from '@agrume/core'

export const createRoute = _createRoute

/* eslint-disable ts/no-namespace */
// eslint-disable-next-line ts/no-redeclare
export namespace createRoute {
  export namespace Helpers {
    export namespace InferRouteTypes {
      export type Parameters<R extends RouteTypes<AnyRoute> | undefined>
        = InferRouteParameters<R>
      export type ReturnType<R extends RouteTypes<AnyRoute> | undefined>
        = InferRouteReturnType<R>
    }
  }
}
/* eslint-enable ts/no-namespace */
