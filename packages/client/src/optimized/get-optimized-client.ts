/**
 * Get the optimized client.
 * @returns {Function} The optimized client.
 */
export function getOptimizedClient() {
  // We need to wrap globalThis.__agrumeClient in a function because Agrume
  // will compile and stringify getOptimizedClient. If we don't wrap it in a
  // function, the stringified version will not be "globalThis.__agrumeClient"
  return function (...args: Parameters<typeof globalThis['__agrumeClient']>) {
    return globalThis.__agrumeClient(...args)
  }
}
