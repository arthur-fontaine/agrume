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
  .action(async (library, { disableLogger, entry, output }) => {
    if (library !== 'fastify') {
      logger.error(`Library \`${library}\` is not supported`)
      process.exit(1)
    }

    const config = await utils.readConfig()

    await getAgrumeMiddleware({
      config,
      entry: findEntryFile(entry.split(',')),
    })

    const builder = {
      fastify: fastifyBuilder,
    }[library]

    runBuilder(builder, {
      destination: output,
      enableLogger: !disableLogger,
      listen: config.port,
    })
  })
