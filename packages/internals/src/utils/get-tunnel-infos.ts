import { machineIdSync } from 'node-machine-id'
import { checksum } from './checksum'

type TunnelInfos =
  | { tunnelDomain: 'loca.lt', tunnelSubdomain: string, type: 'localtunnel' }

/**
 * Get the tunnel infos for the given tunnel type.
 * @param {string} [tunnelType] The tunnel type.
 * @returns {TunnelInfos} The tunnel URL.
 */
export function getTunnelInfos(tunnelType: TunnelInfos['type']): TunnelInfos {
  switch (tunnelType) {
  case 'localtunnel': {
    const machineId = machineIdSync()
    return {
      tunnelDomain: 'loca.lt',
      tunnelSubdomain: checksum(machineId),
      type: 'localtunnel',
    }
  }
  }
}
