import type { CliOptions } from '@agrume/types'

import { watchConfig as _watchConfig, loadConfig } from 'c12'

/**
 * Load a configuration file.
 * @param {Function} onChange The function to call when the configuration changes.
 * @returns {Promise<CliOptions>} The configuration object.
 */
export async function readConfig(onChange?: (config: CliOptions) => void) {
  if (onChange !== undefined) {
    const { config } = await _watchConfig<CliOptions>({
      name: 'agrume',
      onUpdate(context) {
        onChange(context.newConfig.config)
      },
    })

    return config
  }

  const { config } = await loadConfig<CliOptions>({
    name: 'agrume',
  })

  return config
}
