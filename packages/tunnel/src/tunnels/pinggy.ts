import { exec } from 'node:child_process'
import { AbstractTunnel } from './abstract-tunnel'

/**
 *
 */
export class Pinggy extends AbstractTunnel {
  public CONNECTION_HOST: string
  public TUNNEL_HOST: string
  public tunnelSubdomain: string

  /**
   * Constructor.
   * @param {string} tunnelSubdomain The tunnel subdomain.
   * @param {string} [CONNECTION_HOST] The remote host. Default is 'a.pinggy.io'.
   * @param {string} [TUNNEL_HOST] The tunnel host. Default is 'a.pinggy.link'.
   */
  constructor(
    {
      CONNECTION_HOST = 'a.pinggy.io',
      TUNNEL_HOST = 'a.pinggy.link',
      tunnelSubdomain,
    }: {
      CONNECTION_HOST?: string
      TUNNEL_HOST?: string
      tunnelSubdomain: string
    },
  ) {
    super()
    this.tunnelSubdomain = tunnelSubdomain
    this.CONNECTION_HOST = CONNECTION_HOST
    this.TUNNEL_HOST = TUNNEL_HOST
  }

  /**
   * Connect to the tunnel.
   * @param {number} localPort The local port.
   * @param {AbstractTunnel.TunnelConnectOptions} options The options.
   */
  async connect(
    localPort: number,
    options: AbstractTunnel.TunnelConnectOptions,
  ): Promise<void> {
    if (!options.accessToken) {
      // eslint-disable-next-line fp/no-throw
      throw new Error('Pinggy requires an access token')
    }

    const pinggyProcess = exec(`ssh -p 443 -R0:localhost:${localPort} ${options.accessToken}@${this.CONNECTION_HOST}`)

    pinggyProcess.stderr?.on('data', (data) => {
      console.error(data)
    })
  }

  /**
   * Get the tunnel infos.
   * @returns {AbstractTunnel.TunnelInfos} The tunnel infos.
   */
  getTunnelInfos(): AbstractTunnel.TunnelInfos {
    return {
      url: `https://${this.tunnelSubdomain}.${this.TUNNEL_HOST}`,
    }
  }
}
