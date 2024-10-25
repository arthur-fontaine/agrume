import { Buffer } from 'node:buffer'
import { machineIdSync } from 'node-machine-id'
import localtunnel from 'localtunnel'
import { AbstractTunnel } from './abstract-tunnel'

/**
 *
 */
export class Localtunnel extends AbstractTunnel {
  public TUNNEL_HOST: string

  /**
   * Constructor.
   * @param {string} [TUNNEL_HOST] The tunnel host. Default is 'bore.pub'.
   */
  constructor(
    { TUNNEL_HOST = 'loca.lt' }: { TUNNEL_HOST?: string } = {},
  ) {
    super()
    this.TUNNEL_HOST = TUNNEL_HOST
  }

  /**
   * Connect to the tunnel.
   * @param {number} localPort The local port.
   */
  async connect(localPort: number): Promise<void> {
    await localtunnel({
      host: `https://${this.TUNNEL_HOST}`,
      local_host: 'localhost',
      port: localPort,
      subdomain: this.getRemoteSubdomain(),
    })
  }

  /**
   * Get the remote subdomain.
   * @returns {string} The remote subdomain.
   */
  getRemoteSubdomain(): string {
    const machineId = machineIdSync()
    const base64MachineId = Buffer.from(machineId).toString('base64')
    const subdomain = base64MachineId.replace(/[+/=]/g, '').slice(0, 12).toLowerCase()
    return subdomain
  }

  /**
   * Get the tunnel infos.
   * @returns {AbstractTunnel.TunnelInfos} The tunnel infos.
   */
  getTunnelInfos(): AbstractTunnel.TunnelInfos {
    return {
      url: `https://${this.getRemoteSubdomain()}.${this.TUNNEL_HOST}`,
    }
  }
}
