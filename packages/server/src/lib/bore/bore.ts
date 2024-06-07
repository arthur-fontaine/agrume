import { exec } from 'node:child_process'

interface BoreOptions {
  localPort: number
  remoteHost?: string
  remotePort?: number
}

/**
 * Register a Bore tunnel.
 * @param {object} options The options.
 * @param {number} options.localPort The local port.
 * @param {string} options.remoteHost The remote host.
 * @param {number} options.remotePort The remote port.
 * @returns {void}
 */
export function bore({
  localPort,
  remoteHost,
  remotePort,
}: BoreOptions) {
  const boreProcess = exec(`bore local ${localPort}\
    ${remoteHost ? ` --to ${remoteHost}` : ''}\
    ${remotePort ? ` --port ${remotePort}` : ''}`)

  boreProcess.stderr?.on('data', (data) => {
    console.error(data)
  })
}
