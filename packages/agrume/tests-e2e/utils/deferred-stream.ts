/**
 * Returns a stream and functions to control it.
 * @returns {object} The stream and functions to control it.
 */
export function deferredStream() {
  let sendData: (data: string) => void
  let closeStream: () => void

  const stream = new ReadableStream({
    async start(controller) {
      sendData = data => controller.enqueue(data)
      closeStream = () => controller.close()
    },
  })

  return {
    closeStream: closeStream!,
    sendData: sendData!,
    stream,
  }
}
