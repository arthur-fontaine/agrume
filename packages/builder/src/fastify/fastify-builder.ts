/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import fs from 'node:fs'
import path from 'node:path'
import { options, state } from '@agrume/internals'
import { AGRUME_SEND_STREAM_PATH } from '@agrume/core'
import type { Builder, BuilderOptions } from '../types/builder'

export const fastifyBuilder: Builder = function* (options) {
  const templateDir = path.join(__dirname, 'templates', 'fastify')

  yield {
    filename: 'agrume-route-handler.ts',
    content: fs.readFileSync(path.join(templateDir, 'fastify-route-handler.ts'))
      .toString('utf8')
      .replace('./route-handler', './base-agrume-route-handler'),
  }

  yield {
    filename: 'base-agrume-route-handler.ts',
    content: fs.readFileSync(path.join(templateDir, 'route-handler.ts')).toString('utf8'),
  }

  const routes = yield* createRoutes('server', options.singleFile ?? false)

  yield {
    filename: 'index.ts',
    content: `
    import fastify from 'fastify'
    import { FastifyRouteHandler } from './agrume-route-handler'

    const server = fastify(${createOptions(options)})

    ${routes}

    ${options.listen !== undefined ? createListener(options.listen, 'server') : ''}
    `,
  }
}

function createOptions(options: BuilderOptions) {
  let optionsString = '{'

  if (options.enableLogger) {
    optionsString += 'logger: true,'
  }

  optionsString += '}'

  return optionsString
}

function* createRoutes(serverName: string, singleFile: boolean) {
  const routes = state.get().routes
  const prefix = options.get().prefix

  let indexRegister = ''

  for (const [routeName, route] of routes.entries()) {
    const routePath = prefix + routeName
    const streamRoutePath = routePath + AGRUME_SEND_STREAM_PATH

    const routeHandler = `
    ${serverName}.post(${JSON.stringify(routePath)}, async (request, reply) =>
      new FastifyRouteHandler(${route.toString()}, request, reply).run()
    )

    ${serverName}.post(${JSON.stringify(streamRoutePath)}, async (request, reply) =>
      new FastifyRouteHandler(async () => {}, request, reply).run()
    )
    `

    if (singleFile) {
      indexRegister += routeHandler
    } else {
      const routeFilepath = path.join('agrume', routeName + '.ts')
      yield {
        filename: routeFilepath,
        content: `
        import type { FastifyInstance } from 'fastify'
        import { FastifyRouteHandler } from '../agrume-route-handler'

        export default async function (${serverName}: FastifyInstance) {
          ${routeHandler}
        }
        `,
      }
      indexRegister += `${serverName}.register(await import('./${routeFilepath}'))\n`
    }
  }

  return indexRegister
}

function createListener(port: number, serverName: string) {
  return `
  ${serverName}.listen({ port: ${port} })
  `
}
