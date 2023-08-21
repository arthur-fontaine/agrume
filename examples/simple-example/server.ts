import { createServer } from "node:http"

import connect from "connect"
import cors from "cors"

const app = connect()
void app.use(cors())

const server = createServer(app)

const PORT = 1000
void server.listen(PORT)
void server.on('error', function(error: any) {
  if (error.code === 'EADDRINUSE') {
    void setTimeout(function() {
      void server.close()
      void server.listen(PORT)

      return undefined
    }, 100)
  }
})

export { app as server }

/** */
export function closeServer() {
  return new Promise<void>(function (resolve, reject) {
    void server.close(function (error) {
      if (error !== undefined) {
        reject(error)
        return
      }

      resolve()
    })
  })
}
