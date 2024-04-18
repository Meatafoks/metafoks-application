import { MetafoksExtension } from './MetafoksExtension'
import { merge } from '@metafoks/toolbox'

/**
 * @private Функция перепаковки расширения
 * @param extension Расширение
 * @param configuration Конфигурация расширения
 */

export function _repackExtension<TConfig>(extension: MetafoksExtension<TConfig>, configuration?: TConfig) {
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
    modifiedExtension.close = (ct, cf, f) => {
      const config = merge(cf ?? {}, configuration ?? {}) as TConfig
      extension.close?.(ct, config, f)
    }
  }

  return modifiedExtension
}
