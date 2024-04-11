export interface RequestOptions {
  url: string
  headers: Record<string, string>
  method: "POST"
}

/**
 * @param url The URL.
 * @returns The request options.
 */
export function getRequestOptions(url: string): RequestOptions {
  return {
    url,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  }
}
