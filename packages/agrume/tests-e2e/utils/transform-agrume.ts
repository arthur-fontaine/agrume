import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import _babel from '@babel/core'
import createJiti from 'jiti'
import agrumePreset from '../../../babel-preset-agrume'
import type agrume from '../../../plugin/src/vite'

const babel = ('default' in _babel ? _babel.default : _babel) as typeof _babel

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
 * @param {object} [agrumeOptions] The options for Agrume.
 * @returns {Promise<{ code: string, run: () => void }>} The transformed code.
 */
export async function transformAgrume(
  code: string,
  agrumeOptions?: Omit<NonNullable<Parameters<typeof agrume>[0]>, 'tunnel' | 'useMiddleware'>,
) {
  const result = babel.transformSync(code, {
    babelrc: false,
    configFile: false,
    filename: 'agrume.ts',
    presets: [[agrumePreset, agrumeOptions]],
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
