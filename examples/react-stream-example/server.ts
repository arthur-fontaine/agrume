import { createServer } from 'node:http'

import connect from 'connect'
import cors from 'cors'

const app = connect()
void app.use(cors())

const server = createServer(app)

const PORT = 1000
void server.listen(PORT)
// eslint-disable-next-line ts/no-explicit-any
server.on('error', (error: any) => {
  if (error.code === 'EADDRINUSE') {
    void setTimeout(() => {
      void server.close()
      void server.listen(PORT)

      return undefined
    }, 100)
  }
})

export { app as server }

/**
 * Close the server.
 */
export function closeServer() {
  return new Promise<void>((resolve, reject) => {
    void server.close((error) => {
      if (error !== undefined) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
