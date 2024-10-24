import { exec } from 'node:child_process'

interface PinggyOptions {
  accessToken: string
  localPort: number
  remoteHost?: string
  subdomain: string
}

/**
 * Register a Pinggy tunnel.
 * @param {object} options The options.
 * @param {string} options.accessToken The access token.
 * @param {number} options.localPort The local port.
 * @param {string} [options.remoteHost] The remote host.
 * @returns {void}
 */
export function pinggy({
  accessToken,
  localPort,
  remoteHost = 'a.pinggy.io',
}: PinggyOptions) {
  const pinggyProcess = exec(`ssh -p 443 -R0:localhost:${localPort} ${accessToken}@${remoteHost}`)

  pinggyProcess.stderr?.on('data', (data) => {
    console.error(data)
  })
}
