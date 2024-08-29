import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

import react from '@vitejs/plugin-react'
import connect from 'connect'
import tmp from 'tmp-promise'
import * as vite from 'vite'
import agrume from '../../../plugin/src/vite'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

/**
 * Test util to load an Agrume project with Vite.
 * @param {string} appString The stringify code of the app.tsx file.
 * @returns {object} The server and maybe more according to what tests need.
 */
export async function loadAgrumeProject(appString: string) {
  const closeSteps: (() => Promise<void>)[] = []
  let closeAlreadyRun = false
  const close = async () => {
    if (closeAlreadyRun) {
      return
    }
    closeAlreadyRun = true

    for (const closeStep of closeSteps) {
      await closeStep()
    }
  }

  try {
    const templateDirPath = path.join(dirname, '..', 'template')

    const tmpDir = await tmp.dir({
      tmpdir: dirname,
      unsafeCleanup: true,
    })
    closeSteps.push(async () => {
      fs.rmSync(tmpDir.path, { force: true, recursive: true })
    })

    await fs.promises.cp(templateDirPath, tmpDir.path, { recursive: true })
    await fs.promises.writeFile(path.join(tmpDir.path, 'src', 'app.tsx'), appString)

    const server = connect()

    await vite.build({
      logLevel: 'silent',
      plugins: [
        agrume({
          useMiddleware: server.use.bind(server),
        }),
        react(),
        {
          closeBundle: close,
          name: 'remove-tmp',
        },
      ],
      resolve: {
        alias: {
          agrume: path.join(dirname, '..', '..', 'src', 'agrume.ts'),
        },
      },
      root: tmpDir.path,
    })

    return { close, server }
  }
  finally {
    close()
  }
}
