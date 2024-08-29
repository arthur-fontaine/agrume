import crypto from 'node:crypto'

/**
 * Get the checksum of a string.
 * @param {string} string_ The string to get the checksum of.
 * @returns {string} The checksum of the string.
 */
export function checksum(string_: string): string {
  const hash = crypto.createHash('sha256').update(string_).digest('hex')

  let sumOfNumbers = 0
  for (const char of hash) {
    const charCode = char.charCodeAt(0)
    if (!Number.isNaN(charCode)) {
      sumOfNumbers += charCode
    }
  }

  return hash.slice(0, Math.max(6, sumOfNumbers % 12))
}
