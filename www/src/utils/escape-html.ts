/**
 * Escapes HTML special characters in a string.
 * @param {string} string_ The string to escape.
 * @returns {string} The escaped string.
 */
export function escapeHTML(string_: string) {
  return string_.replaceAll(
    /["&'<>]/g,
    (tag) => {
      return ({
        '"': '&quot;',
        '&': '&amp;',
        '\'': '&#39;',
        '<': '&lt;',
        '>': '&gt;',
      }[tag]) as string
    },
  )
}
