/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import fs from 'node:fs'
import path from 'node:path'
import { options, state } from '@agrume/internals'
import { AGRUME_SEND_STREAM_PATH } from '@agrume/core'
import type { Builder, BuilderOptions } from '../types/builder'

export const fastifyBuilder: Builder = (options) => {
  const templateDir = path.join(__dirname, '..', 'templates', 'fastify')
  return {
    'index.ts': `
    import fastify from 'fastify'
    import { FastifyRouteHandler } from './agrume-route-handler'

    const server = fastify(${createOptions(options)})

    ${createRoutes('server')}

    ${options.listen !== undefined ? createListener(options.listen, 'server') : ''}
    `,
    'agrume-route-handler.ts': fs.readFileSync(path.join(templateDir, 'fastify-route-handler.ts'))
      .toString('utf8')
      .replace('./route-handler', './base-agrume-route-handler'),
    'base-agrume-route-handler.ts': fs.readFileSync(path.join(templateDir, 'route-handler.ts')).toString('utf8'),
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

function createRoutes(serverName: string) {
  const routes = state.get().routes
  const prefix = options.get().prefix

  return Array.from(routes.entries()).map(([routeName, route]) => {
    const routePath = prefix + routeName
    const streamRoutePath = routePath + AGRUME_SEND_STREAM_PATH
    return `
    ${serverName}.post(${JSON.stringify(routePath)}, async (request, reply) =>
      new FastifyRouteHandler(${route.toString()}, request, reply).run()
    )

    ${serverName}.post(${JSON.stringify(streamRoutePath)}, async (request, reply) =>
      new FastifyRouteHandler(async () => {}, request, reply).run()
    )
    `
  }).join('\ns')
}

function createListener(port: number, serverName: string) {
  return `
  ${serverName}.listen({ port: ${port} })
  `
}
