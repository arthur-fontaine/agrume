// https://stackoverflow.com/a/3276730/13123142

/**
 * Get the checksum of a string.
 * @param {string} string_ The string to get the checksum of.
 * @returns {string} The checksum of the string.
 */
export function checksum(string_: string): string {
  const chk = (string_
    .split('')
    .reduce((previousValue, currentValue, currentIndex) => {
      return (
        previousValue
        + ((currentValue.codePointAt(0) ?? 0) * (currentIndex + 1))
      )
    }, 0x12_34_56_78))

  return (chk & 0xFF_FF_FF_FF).toString(16)
}
