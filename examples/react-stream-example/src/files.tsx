import { createRoute } from 'agrume'
import React, { useEffect, useState } from 'react'

const currentPath = '/Users/arthurfontaine/Developer/code/github.com/arthur-fontaine/agrume/examples/react-stream-example/src'

const getFiles = createRoute(
  async function* () {
    const fs = await import('node:fs')

    const files = fs.promises.watch(`${currentPath}/test`)

    for await (const file of files) {
      yield file.filename
    }
  },
)

/**
 * A component that renders the files in the test directory.
 * @returns {React.ReactElement} The component.
 */
export const Files = function () {
  const [files, setFiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    (async () => {
      const it = await getFiles()
      for await (const file of it) {
        setFiles(files => new Set(files).add(file))
      }
    })()
  }, [])

  return (
    <div>
      {[...files].map((file, index) => (
        <div key={index}>{file}</div>
      ))}
    </div>
  )
}
