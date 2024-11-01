import fs from 'node:fs'
import path from 'node:path'
import prettier from 'prettier'
import type { Builder, BuilderOptions } from './types/builder'

/**
 * Run a builder and write the results to the destination directory.
 * @param {Builder} builder The builder.
 * @param {BuilderOptions & { destination: string }} options The options.
 */
export async function runBuilder(builder: Builder, options: BuilderOptions & {
  destination: string
}) {
  const results = builder(options)

  fs.rmSync(options.destination, { force: true, recursive: true })

  for (const { content, filename } of results) {
    const filePath = path.join(options.destination, filename)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, await formatContent(filename, content))
  }
}

async function formatContent(fileName: string, content: string) {
  const jsExtensions = ['.js', '.ts', '.tsx', '.jsx', '.mjs', '.cjs', '.mts', '.cts']
  const isJs = jsExtensions.some(ext => fileName.endsWith(ext))
  if (isJs) {
    return await prettier.format(content, { filepath: fileName })
  }

  return content
}
