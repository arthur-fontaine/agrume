import { exec } from 'node:child_process'
import { machineIdSync } from 'node-machine-id'
import { AbstractTunnel } from './abstract-tunnel'

/**
 *
 */
export class Bore extends AbstractTunnel {
  public TUNNEL_HOST: string

  /**
   * Constructor.
   * @param {string} [TUNNEL_HOST] The tunnel host. Default is 'bore.pub'.
   */
  constructor(
    { TUNNEL_HOST = 'bore.pub' }: { TUNNEL_HOST?: string } = {},
  ) {
    super()
    this.TUNNEL_HOST = TUNNEL_HOST
  }

  /**
   * Connect to the tunnel.
   * @param {number} localPort The local port.
   */
  async connect(localPort: number): Promise<void> {
    const remotePort = this.getRemotePort()
    const boreProcess = exec(`bore local ${localPort}\
      ${this.TUNNEL_HOST ? ` --to ${this.TUNNEL_HOST}` : ''}\
      ${remotePort ? ` --port ${remotePort}` : ''}`)

    boreProcess.stderr?.on('data', (data) => {
      console.error(data)
    })
  }

  /**
   * Get the remote port.
   * @returns {number} The remote port.
   */
  getRemotePort(): number {
    const machineId = machineIdSync()

    const removeScientificNotation = (number: string) =>
      number.split('e')[0]!.replace('.', '').slice(-2)

    const n = Number(
      removeScientificNotation(Number.parseInt(machineId, 16).toString()),
    )

    const determinedPort = removeScientificNotation(
      Number.parseInt(machineId, n % 32).toString(),
    )
      ?.repeat(10)
      .slice(n % 10, n % 10 + 4)

    return Number.parseInt(determinedPort)
  }

  /**
   * Get the tunnel infos.
   * @returns {AbstractTunnel.TunnelInfos} The tunnel infos.
   */
  getTunnelInfos(): AbstractTunnel.TunnelInfos {
    return {
      url: `http://${this.TUNNEL_HOST}:${this.getRemotePort()}`,
    }
  }
}
