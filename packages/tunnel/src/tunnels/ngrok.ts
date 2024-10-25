import { AbstractTunnel } from './abstract-tunnel'

/**
 *
 */
export class Ngrok extends AbstractTunnel {
  public tunnelDomain: string

  /**
   * Constructor.
   * @param {string} tunnelDomain The tunnel domain.
   */
  constructor(
    { tunnelDomain }: { tunnelDomain: string },
  ) {
    super()
    this.tunnelDomain = tunnelDomain
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
    const ngrok = await import('@ngrok/ngrok')
    if (!options.accessToken) {
      // eslint-disable-next-line fp/no-throw
      throw new Error('Ngrok requires an access token')
    }

    await ngrok.connect({
      authtoken: options.accessToken,
      domain: this.tunnelDomain,
      host: 'localhost',
      port: localPort,
    })
  }

  /**
   * Get the tunnel infos.
   * @returns {AbstractTunnel.TunnelInfos} The tunnel infos.
   */
  getTunnelInfos(): AbstractTunnel.TunnelInfos {
    return {
      url: `https://${this.tunnelDomain}`,
    }
  }
}
