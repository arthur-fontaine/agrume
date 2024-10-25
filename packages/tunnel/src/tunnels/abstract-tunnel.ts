import type * as tunnels from './tunnels'

/**
 * Abstract class for tunneling services.
 */
export abstract class AbstractTunnel {
  abstract connect(
    localPort: number,
    options: AbstractTunnel.TunnelConnectOptions,
  ): Promise<void>
  abstract getTunnelInfos(): AbstractTunnel.TunnelInfos
}

// eslint-disable-next-line ts/no-namespace
export namespace AbstractTunnel {
  export interface TunnelConnectOptions {
    accessToken?: string
  }

  export interface TunnelInfos {
    url: string
  }

  export type TunnelType = keyof typeof tunnels

  export type TunnelFlattenOptions<T extends TunnelType> =
    ConstructorParameters<typeof tunnels[T]>[0] &
    { connectionArgs: TunnelConnectOptions } &
    { type: T }
}
