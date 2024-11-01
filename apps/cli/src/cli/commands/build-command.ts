import path from 'node:path'
import process from 'node:process'
import { fastifyBuilder, runBuilder } from '@agrume/builder'
import { createCommand, program } from 'commander'
import { state, utils } from '@agrume/internals'
import Watcher from 'watcher'
import { getAgrumeMiddleware } from '../get-agrume-middleware'
import { entryOption } from '../options/entry-option'
import { findEntryFile } from '../find-entry-file'
import { logger } from '../logger'

export const buildCommand = createCommand('build')
  .description('Build the project')
  .argument('[library]', 'The library to compile for. Choices: fastify', 'fastify')
  .addOption(entryOption)
  .option('-o, --output <output>', 'The output directory', 'build')
  .option('--disable-logger', 'Disable the logger')
  .option('--single-file', 'Generate a single file', false)
  .option('-p, --port <port>', 'The port the server will listen on. By default, it uses the port from the config file. Set a string to select an environment variable. Set to an empty string to not generate listen code.')
  .option('-w, --watch [target]', 'Watch for changes in the target directory')
  .action(async (library, options) => {
    // This is a workaround to still get the options even if they are parsed in the parent command
    const programOptions = program.opts()
    for (const key in programOptions) {
      if (options[key as never] === undefined) {
        options[key as never] = programOptions[key as never]
      }
    }

    if (library !== 'fastify') {
      logger.error(`Library \`${library}\` is not supported`)
      process.exit(1)
    }

    const config = await utils.readConfig()

    const builder = {
      fastify: fastifyBuilder,
    }[library]

    const entryFile = findEntryFile(options.entry.split(','))

    const build = async () => {
      await getAgrumeMiddleware({
        config,
        entry: entryFile,
      })

      await runBuilder(builder, {
        destination: options.output,
        enableLogger: !options.disableLogger,
        listen: options.port === '' ? undefined
        : (options.port ?? (config.port ? config.port.toString() : undefined)),
        singleFile: options.singleFile,
      })
    }

    if (options.watch) {
      let watchTarget = path.dirname(entryFile)
      if (typeof options.watch === 'string') {
        watchTarget = options.watch
      }

      const watcher = new Watcher(watchTarget, {
        ignoreInitial: true,
        recursive: true,
      })

      logger.info(`Watching for changes in ${watchTarget}`)

      watcher.on('all', async () => {
        logger.info('Detected changes, re-building...')
        logger.log('')
        state.set((state) => {
          state.routes.clear()
          return state
        })
        await build()
      })
      await build()
    }
    else {
      await build()
      process.exit(0)
    }
  })
