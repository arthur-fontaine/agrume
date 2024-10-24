import { machineIdSync } from 'node-machine-id'
import type { GlobalOptions } from '@agrume/types'
import { checksum } from './checksum'

type TunnelInfos =
  | { tunnelAccessToken: string, tunnelDomain: 'a.pinggy.io', tunnelSubdomain: string, type: 'pinggy' }
  | { tunnelDomain: 'bore.pub', tunnelPort: number, type: 'bore' }
  | { tunnelDomain: 'loca.lt', tunnelSubdomain: string, type: 'localtunnel' }
  | { tunnelDomain: string, type: 'ngrok' }

/**
 * Get the tunnel infos for the given tunnel type.
 * @param {string} [tunnel] The tunnel type.
 * @returns {TunnelInfos} The tunnel URL.
 */
export function getTunnelInfos(tunnel: NonNullable<GlobalOptions['tunnel']>): TunnelInfos {
  switch (tunnel.type) {
  case 'localtunnel': {
    const machineId = machineIdSync()
    return {
      tunnelDomain: 'loca.lt',
      tunnelSubdomain: checksum(machineId),
      type: 'localtunnel',
    }
  }
  case 'bore': {
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

    return {
      tunnelDomain: 'bore.pub',
      tunnelPort: Number.parseInt(determinedPort),
      type: 'bore',
    }
  }
  case 'ngrok': {
    return {
      tunnelDomain: tunnel.domain,
      type: 'ngrok',
    }
  }
  case 'pinggy': {
    return {
      tunnelAccessToken: tunnel.accessToken,
      tunnelDomain: 'a.pinggy.io',
      tunnelSubdomain: tunnel.domain,
      type: 'pinggy',
    }
  }
  default: {
    tunnel satisfies never
    return null!
  }
  }
}
