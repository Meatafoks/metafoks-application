import { LoggerFactory } from '@metafoks/logger'
import { getApplicationContainerIdentifier } from './identify'
import { IMetafoksApplicationInstance, MetafoksApplicationTarget } from './interfaces'
import { MetafoksEnv } from './env'
import {
  MetafoksConfigLoaderConfiguration,
  MetafoksConfigLoader,
  MetafoksExtensionsLoader,
  MetafoksExtensionsLoaderConfiguration,
  MetafoksLoggerConfiguration,
  MetafoksLogger,
} from './loaders'
import { merge } from '@metafoks/toolbox'
import { MetafoksEvents } from './events'
import { MetafoksScanner, MetafoksScannerProperties } from './scanner'
import { MetafoksContainer, MetafoksContainerProperties } from './context'
import { ComponentConstructor } from './types'
import { METAFOKS_CONTEXT_INJECT_COMPONENT } from './idntifiers'
import 'reflect-metadata'

declare global {
  type MetafoksAppConfig = any
}

export interface MetafoksApplicationConfiguration {
  config?: MetafoksConfigLoaderConfiguration
  extensions?: MetafoksExtensionsLoaderConfiguration
  logger?: MetafoksLoggerConfiguration
  scanner?: Partial<MetafoksScannerProperties>
  container?: Partial<MetafoksContainerProperties>

  scanComponents?: boolean
}

export interface MetafoksApplicationConfigurationExtra extends MetafoksApplicationConfiguration {
  overrides?: MetafoksApplicationConfiguration & MetafoksAppConfig
}

export class MetafoksApplication implements IMetafoksApplicationInstance {
  /**
   * Boolean variable indicating whether the decorator autorun should be ignored.
   *
   * Если установлено true, декоратор @Application не будет выполнять запуск приложения
   *
   *
   * @type {boolean}
   */
  public static ignoreDecoratorAutorun: boolean = MetafoksEnv.get('METAFOKS_DISABLE_APP_AUTORUN') === 'true'

  private static _sharedInstance?: MetafoksApplication = undefined

  public static get shared(): MetafoksApplication {
    if (!MetafoksApplication._sharedInstance) MetafoksApplication._sharedInstance = new MetafoksApplication('shared')
    return MetafoksApplication._sharedInstance
  }

  private _configOverrides: MetafoksApplicationConfiguration & MetafoksAppConfig = {}
  private readonly _logger = LoggerFactory.create(MetafoksApplication)

  /**
   * Логгер
   */
  public readonly loggerLoader = new MetafoksLogger()

  /**
   * Загрузчик конфигурации
   */
  public readonly configLoader = new MetafoksConfigLoader()

  /**
   * Контейнер зависимостей
   */
  public readonly container = new MetafoksContainer(`${this._instanceName}@default`)

  /**
   * Сканер компонентов
   */
  public readonly scanner = new MetafoksScanner()

  /**
   * События приложения
   */
  public readonly events = new MetafoksEvents()

  /**
   * Загрузчик расширений
   */
  public readonly extensions = new MetafoksExtensionsLoader(this)

  public constructor(private _instanceName: string) {}

  /**
   * Возвращает идентификатор компонента приложения в контейнере
   */
  public getContainerId() {
    return getApplicationContainerIdentifier(this._instanceName)
  }

  /**
   * Возвращает компонент приложения из контейнера
   */
  public getComponent() {
    return this.container.getFirst<MetafoksApplicationTarget>(this.getContainerId())
  }

  /**
   * Конфигурация приложения
   */
  public get configuration(): Readonly<MetafoksApplicationConfiguration & MetafoksAppConfig> {
    return Object.freeze(
      merge.withOptions({ mergeArrays: false }, this.configLoader.configuration, this._configOverrides),
    )
  }

  /**
   * Добавляет переопределение значений конфигурации
   * @param config
   */
  public overrideConfigValues(config?: MetafoksApplicationConfiguration & MetafoksAppConfig) {
    if (config) {
      this._configOverrides = merge.withOptions({ mergeArrays: false }, this._configOverrides, config)
      this._logger.info(`overridden config values = ${JSON.stringify(config)}`)
    }
  }

  /**
   * Устанавливает компонент приложения в контейнер
   * @param target
   */
  public setComponent(target: ComponentConstructor) {
    Reflect.defineMetadata('application', this, target)
    this.container.set(this.getContainerId(), target)
  }

  /**
   * Configure method is used to update the configuration of the MetafoksApplication instance.
   *
   * @param {Partial<MetafoksApplicationConfiguration>} config - The configuration object containing updates for the MetafoksApplication instance.
   *
   * @return {void} - This method does not return anything.
   */
  public configure(config?: MetafoksApplicationConfigurationExtra): void {
    this.loggerLoader.configure(config?.logger)

    if (config) {
      this.configLoader.configure(config.config)
      this.extensions.configure(config.extensions)
      this.overrideConfigValues(config.overrides)
      this.scanner.configure(config.scanner)
      this.container.configure(config.container)
    }
  }

  /**
   * Запускает приложение
   */
  public async start(config?: MetafoksApplicationConfigurationExtra) {
    this.events.dispatch('beforeStart')
    this._logger.debug('starting application...')

    this.configure(config)
    this.configLoader.configReadProfiledJSON()
    this.events.dispatch('afterApplicationConfigLoaded', this.configuration)

    this.loggerLoader.loggerEnableForWrite()
    this.loggerLoader.configure(this.configuration.logger)

    await this._registerConfig()
    await this._registerAutoComponents()

    await this._startExtensionsLoader()
    this._startCloseSignalListener()

    await this._invokeApplicationComponentStart()
    this.events.dispatch('afterStart')
  }

  /**
   * Останавливает приложение
   * @param force - флаг принудительной остановки
   */
  public async stopApplication(force: boolean = false) {
    this.events.dispatch('beforeClose', force)

    this._logger.debug(`stopping application [force=${force}]`)
    if (this.extensions.extensionsTestModuleEnabled()) {
      await this.extensions.extensionsClose(force, this.configuration)
    }
    this._logger.info('application has been stopped')
    this.events.dispatch('afterClose')
  }

  /**
   * Регистрирует конфигурацию приложения
   * @private
   */
  private async _registerConfig() {
    const config = this.configuration
    this.container.set('config', config)
  }

  /**
   * Регистрирует компоненты приложения
   * @private
   */
  private async _registerAutoComponents() {
    if (this.configuration.scanComponents !== false) {
      const components = await this.scanner.scanClassComponents(METAFOKS_CONTEXT_INJECT_COMPONENT)
      for (const component of components) {
        this.container.set(component.tokenName, component.target, component.isMultiple)
      }

      this._logger.info(`registered <${Object.values(components).length}> components`)
    } else {
      this._logger.warn(`components scanning is disabled: <config.scanComponents = false>`)
    }
  }

  /**
   * Запускает загрузчик расширений
   * @private
   */
  private async _startExtensionsLoader() {
    if (this.extensions.extensionsTestModuleEnabled()) {
      this.extensions.extensionsInstallToContainer(this.configuration)
      await this.extensions.extensionsStartAutorun(this.configuration)
    }
  }

  /**
   * Вызывает метод старта компонента приложения
   * @private
   */
  private async _invokeApplicationComponentStart() {
    this.events.dispatch('beforeApplicationStartCall')
    const component = this.getComponent()

    if ('start' in component) {
      this._logger.debug('starting application component <start> method')
      await component.start()
      return
    }

    if ('run' in component) {
      this._logger.debug('starting application component <run> method')
      await component.run()
      return
    }
  }

  /**
   * Запускает слушатель сигналов закрытия приложения
   * @private
   */
  private _startCloseSignalListener() {
    process.once('SIGINT', async () => {
      await this.stopApplication()
    })
    process.once('SIGTERM', async () => {
      await this.stopApplication()
    })
  }
}
