import * as DI from 'diabolo'

interface RouteService extends DI.Service<'RouteService', {
  route: (txt: string) => Promise<string>
}> { }

export const routeService = DI.createService<RouteService>('RouteService')

export const routeServiceImpl = DI.lazyCreateServiceImpl<RouteService>(() => ({
  route: async (txt) => {
    // eslint-disable-next-line no-console
    console.log(txt)
    return 'LOL'
  },
}))
