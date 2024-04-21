import { program } from 'commander'
import { createServer } from './create-server'

program
  .name('agrume')
  .description('Start a server with all Agrume routes found in the project.')
  .option('-p, --port <port>', 'Port to listen on', '3000')
  .option('-h, --host <host>', 'Host to listen on', 'localhost')
  .action(async (options) => {
    await createServer({
      getAgrumeMiddlewareParams: {
        viteConfig: {
          build: { write: false },
        },
      },
      host: options.host,
      port: Number.parseInt(options.port),
    })
  })
  .allowExcessArguments(false)
  .allowUnknownOption(false)
  .helpOption(true)
  .showHelpAfterError()

program.parse()
