import { utils } from '@agrume/internals'
import localtunnel from 'localtunnel'

interface RegisterTunnelOptions {
  host: string
  port: number
  tunnel?: string | undefined
}

/**
 * Register a tunnel.
 * @param {object} options The options.
 * @param {string} options.host The host.
 * @param {number} options.port The port.
 * @param {string} [options.tunnel] The tunnel.
 * @returns {Promise<object>} The tunnel URL if any.
 */
export async function registerTunnel(
  { host, port, tunnel }: RegisterTunnelOptions,
) {
  if (!tunnel || tunnel !== 'localtunnel') {
    return {}
  }

  const tunnelInfos = utils.getTunnelInfos(tunnel)

  switch (tunnelInfos.type) {
  case 'localtunnel': {
    const tunnel = await localtunnel({
      host: `https://${tunnelInfos.tunnelDomain}`,
      local_host: host,
      port,
      subdomain: tunnelInfos.tunnelSubdomain,
    })

    return { type: tunnelInfos.type, url: tunnel.url }
  }
  }
}
