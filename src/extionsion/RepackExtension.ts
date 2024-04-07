import { MetafoksExtension } from './MetafoksExtension'
import { merge } from '@metafoks/toolbox'

export function repackExtension<TConfig>(extension: MetafoksExtension<TConfig>, configuration?: TConfig) {
  const modifiedExtension: MetafoksExtension<TConfig> = {
    identifier: extension.identifier,
    configProperty: extension.configProperty,
  }

  if (extension.install) {
    modifiedExtension.install = (ct, cf) => {
      const config = merge(cf ?? {}, configuration ?? {}) as TConfig
      extension.install?.(ct, config)
    }
  }
  if (extension.autorun) {
    modifiedExtension.autorun = (ct, cf) => {
      const config = merge(cf ?? {}, configuration ?? {}) as TConfig
      extension.autorun?.(ct, config)
    }
  }
  if (extension.close) {
    modifiedExtension.close = (f, ct, cf) => {
      const config = merge(cf ?? {}, configuration ?? {}) as TConfig
      extension.close?.(f, ct, config)
    }
  }

  return modifiedExtension
}
