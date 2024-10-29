import process from 'node:process'
import { fastifyBuilder, runBuilder } from '@agrume/builder'
import { createCommand } from 'commander'
import { utils } from '@agrume/internals'
import { getAgrumeMiddleware } from '../get-agrume-middleware'
import { entryOption } from '../options/entry-option'
import { findEntryFile } from '../find-entry-file'
import { logger } from '../logger'

export const buildCommand = createCommand('build')
  .description('Build the project')
  .argument('[library]', 'The library to compile for. Choices: fastify', 'fastify')
  .option(...entryOption)
  .option('-o, --output <output>', 'The output directory', 'build')
  .option('--disable-logger', 'Disable the logger')
  .option('--single-file', 'Generate a single file', false)
  .option('--listen <port>', 'The port to listen on. By default, it will try to read from the config file and listen on that port. Set to 0 to disable listening.', Number.parseInt)
  .action(async (library, options) => {
    if (library !== 'fastify') {
      logger.error(`Library \`${library}\` is not supported`)
      process.exit(1)
    }

    const config = await utils.readConfig()

    await getAgrumeMiddleware({
      config,
      entry: findEntryFile(options.entry.split(',')),
    })

    const builder = {
      fastify: fastifyBuilder,
    }[library]

    await runBuilder(builder, {
      destination: options.output,
      enableLogger: !options.disableLogger,
      listen: options.listen === 0 ? undefined
      : (options.listen ?? config.port),
      singleFile: options.singleFile,
    })
  })
