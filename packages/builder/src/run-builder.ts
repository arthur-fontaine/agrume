import fs from 'node:fs'
import path from 'node:path'
import type { Builder, BuilderOptions } from './types/builder'

/**
 * Run a builder and write the results to the destination directory.
 * @param {Builder} builder The builder.
 * @param {BuilderOptions & { destination: string }} options The options.
 */
export function runBuilder(builder: Builder, options: BuilderOptions & {
  destination: string
}) {
  const results = builder(options)

  for (const [fileName, content] of Object.entries(results)) {
    const filePath = path.join(options.destination, fileName)
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content)
  }
}
