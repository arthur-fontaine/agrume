import * as esbuild from 'esbuild'

/**
 * @param code The code to transform.
 * @returns The transformed code.
 */
export async function transformTsx(code: string): Promise<string> {
  const result = await esbuild.transform(code, {
    loader: 'tsx',
    format: 'cjs',
    target: 'es2019',
  })

  return result.code
}
