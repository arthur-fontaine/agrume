/**
 * @param string_ - The string to escape.
 * @returns The escaped HTML.
 */
export function escapeHTML(string_: string) {
  return string_.replaceAll(
    /["&'<>]/g,
    function (tag) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;',
      }[tag]) as string
    },
  )
}
