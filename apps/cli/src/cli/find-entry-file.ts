import fs from 'node:fs'
import process from 'node:process'

import { logger } from './logger'

/**
 * Find the entry file in the given list of possible entry files.
 * @param {string[]} possibleEntryFiles The possible entry files.
 * @returns {string | undefined} The entry file.
 */
export function findEntryFile(possibleEntryFiles: string[]): string {
  for (const possibleEntryFile of possibleEntryFiles) {
    if (fs.existsSync(possibleEntryFile)) {
      return possibleEntryFile
    }
  }

  logger.error(`Could not find any of the following entry files: ${possibleEntryFiles.join(', ')}`)
  process.exit(1)
}
