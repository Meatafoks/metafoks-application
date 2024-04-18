import { MetafoksConfigLoaderConfiguration } from './MetafoksConfigLoaderConfiguration'
import { MetafoksEnv } from '../../env'
import { LoggerFactory } from '@metafoks/logger'
import { MetafoksConfigReader } from '@metafoks/config-reader'
import { merge } from '@metafoks/toolbox'

export class MetafoksConfigLoader {
  private _logger = LoggerFactory.create(MetafoksConfigLoader)
  private _configReader = new MetafoksConfigReader()
  private _configuration: MetafoksConfigLoaderConfiguration = {
    profile: MetafoksEnv.get('METAFOKS_PROFILE'),
    configPath: 'config',
  }

  /**
   * Конфигурация приложения
   */
  public get configuration(): Readonly<MetafoksConfigLoaderConfiguration & MetafoksAppConfig> {
    return Object.freeze(this._configuration)
  }

  /**
   * Конфигурирует загрузчик конфигурации приложения
   * @param config
   */
  public configure(config?: Partial<MetafoksConfigLoaderConfiguration>) {
    if (config) {
      this._configuration = merge(this._configuration, config)
      this._logger.info(`changed configuration=${JSON.stringify(config)}`)
    }
  }

  public configReadProfiledJSON() {
    this._logger.debug(`loading config JSON file with profile <${this.configuration.profile}>`)
    this._configReader.configure({ configsPath: this._configuration.configPath, profile: this.configuration.profile })
    this._configuration = merge(this._configuration, this._configReader.getConfigActiveProfileContent())
    this._logger.info(`loaded config JSON file with profile <${this.configuration.profile}>`)
  }
}
