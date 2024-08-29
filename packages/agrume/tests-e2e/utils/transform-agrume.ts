import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import babel from '@babel/core'
import createJiti from 'jiti'
import agrumePreset from '../../../babel-preset-agrume'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const jiti = createJiti(filename, {
  alias: {
    agrume: path.join(dirname, '..', '..', 'src', 'agrume.ts'),
  },
})

/**
 * Transform the code.
 * @param {string} code The code.
 * @returns {Promise<{ code: string, run: () => void }>} The transformed code.
 */
export async function transformAgrume(code: string) {
  const result = babel.transformSync(code, {
    babelrc: false,
    configFile: false,
    filename: 'agrume.ts',
    presets: [agrumePreset],
  })

  const transformedCode = result?.code ?? ''
  const run = () => jiti.evalModule(transformedCode, {
    filename: new URL('agrume.ts', import.meta.url).toString(),
    id: 'agrume.ts',
  })

  return {
    code: transformedCode,
    run,
  }
}
