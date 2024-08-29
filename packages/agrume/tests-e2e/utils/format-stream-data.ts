/**
 * Format the stream data.
 * @param {string} unformattedValue - The unformatted value.
 * @returns {string[]} The formatted value.
 */
export function formatStreamData(unformattedValue: string): string[] {
  const unformattedValues = unformattedValue.split('\n\n')

  return unformattedValues.map((unformattedValue) => {
    if (unformattedValue === '') {
      return undefined
    }

    const DATA_PREFIX = 'data: '
    const data = unformattedValue.startsWith(DATA_PREFIX)
      ? unformattedValue.slice(DATA_PREFIX.length)
      : unformattedValue

    if (data === 'DONE') {
      return undefined
    }

    const RETURN_PREFIX = 'RETURN'
    if (data.startsWith(RETURN_PREFIX)) {
      return JSON.parse(data.slice(RETURN_PREFIX.length)) as string
    }

    return JSON.parse(data) as string
  }).filter(d => d !== undefined)
}
