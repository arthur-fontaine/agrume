import { state } from '@agrume/internals'

import babel from '@babel/core'
import agrumePreset from 'babel-preset-agrume'

/**
 * Transform the code.
 * @param {string} code The code.
 * @param {string} id The id.
 * @returns {Promise<null | { code: string, map: unknown }>} The transformed code.
 */
export async function transform(code: string, id: string) {
  state.set((state) => {
    state.isRegistering = true
    return state
  })

  const extensions = ['.ts', '.tsx', '.js', '.jsx']

  if (!extensions.some(extension => id.endsWith(extension))) {
    return null
  }

  try {
    const result = babel.transformSync(code, {
      filename: id,
      presets: [agrumePreset],
    })

    const transformedCode = result?.code ?? null

    return transformedCode === null
      ? null
      : {
        code: transformedCode,
        // eslint-disable-next-line ts/no-explicit-any
        map: result?.map as any,
      }
  }
  catch (error) {
    console.error(error)
  }

  return null
}
