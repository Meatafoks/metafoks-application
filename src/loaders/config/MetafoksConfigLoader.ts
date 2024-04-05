import { MetafoksConfigLoaderConfiguration } from './MetafoksConfigLoaderConfiguration'
import { MetafoksEnv } from '../../env'
import { LoggerFactory } from '@metafoks/logger'
import { MetafoksConfigReader } from '@metafoks/config-reader'
import { merge } from '@metafoks/toolbox'

export class MetafoksConfigLoader {
  /**
   * Конфигурация приложения
   */
  public static get configuration(): Readonly<MetafoksConfigLoaderConfiguration & MetafoksAppConfig> {
    return Object.freeze(this._configuration)
  }

  /**
   * Конфигурирует загрузчик конфигурации приложения
   * @param config
   */
  public static configure(config?: Partial<MetafoksConfigLoaderConfiguration>) {
    if (config) {
      this._configuration = merge(this._configuration, config)
      this._logger.info(`changed configuration=${JSON.stringify(config)}`)
    }
  }

  private static _logger = LoggerFactory.create(MetafoksConfigLoader)
  private static _configReader = new MetafoksConfigReader()
  private static _configuration: MetafoksConfigLoaderConfiguration = {
    profile: MetafoksEnv.get('METAFOKS_PROFILE'),
    configPath: 'config',
  }

  public static configReadProfiledJSON() {
    this._logger.debug(`loading config JSON file with profile <${this.configuration.profile}>`)
    this._configReader.configure({ configsPath: this._configuration.configPath, profile: this.configuration.profile })
    this._configuration = merge(this._configuration, this._configReader.getConfigActiveProfileContent())
    this._logger.info(`loaded config JSON file with profile <${this.configuration.profile}>`)
  }
}
