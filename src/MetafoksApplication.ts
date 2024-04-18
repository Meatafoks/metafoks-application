import { LoggerFactory } from '@metafoks/logger'
import { Container } from '@metafoks/context'
import { Constructable } from 'typedi/types/types/constructable.type'
import { AbstractConstructable } from 'typedi/types/types/abstract-constructable.type'
import { Token } from 'typedi/types/token.class'
import { MetafoksApplicationComponentIdentifier } from './identify'
import { MetafoksApplicationTarget } from './interfaces'
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
import { MetafoksScanner, MetafoksScannerProperties } from './v2'
import { MetafoksContainer, MetafoksContainerProperties, METAFOKS_CONTEXT_INJECT_COMPONENT } from './v2'

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

export class MetafoksApplication {
  private static _sharedInstance?: MetafoksApplication = undefined

  public static get shared(): MetafoksApplication {
    if (!MetafoksApplication._sharedInstance) MetafoksApplication._sharedInstance = new MetafoksApplication()
    return MetafoksApplication._sharedInstance
  }

  /**
   * Контейнер зависимостей (модулей)
   */
  public static container = Container

  /**
   * Конфигурация приложения
   */
  public static get configuration(): Readonly<MetafoksApplicationConfiguration & MetafoksAppConfig> {
    return Object.freeze(
      merge.withOptions({ mergeArrays: false }, MetafoksConfigLoader.configuration, this._configOverrides),
    )
  }

  /**
   * Добавляет переопределение значений конфигурации
   * @param config
   */
  public static overrideConfigValues(config?: MetafoksApplicationConfiguration & MetafoksAppConfig) {
    if (config) {
      this._configOverrides = merge.withOptions({ mergeArrays: false }, this._configOverrides, config)
      this._logger.info(`overridden config values = ${JSON.stringify(config)}`)
    }
  }

  /**
   * Boolean variable indicating whether the decorator autorun should be ignored.
   *
   * Если установлено true, декоратор @Application не будет выполнять запуск приложения
   *
   *
   * @type {boolean}
   */
  public static ignoreDecoratorAutorun: boolean = MetafoksEnv.get('METAFOKS_DISABLE_APP_AUTORUN') === 'true'

  public static getComponent<T>(type: Constructable<T>): T
  public static getComponent<T>(type: AbstractConstructable<T>): T
  public static getComponent<T>(id: string): T
  public static getComponent<T>(id: Token<T>): T

  /**
   * Возвращает компонент
   * @param value
   */
  public static getComponent<T>(value: any) {
    return Container.get<T>(value)
  }

  /**
   * Retrieves the application component.
   *
   * @return {MetafoksApplicationTarget} The application component.
   */
  public static getApplicationComponent(): MetafoksApplicationTarget {
    return MetafoksApplication.getComponent<MetafoksApplicationTarget>(MetafoksApplicationComponentIdentifier)
  }

  /**
   * Configure method is used to update the configuration of the MetafoksApplication instance.
   *
   * @param {Partial<MetafoksApplicationConfiguration>} config - The configuration object containing updates for the MetafoksApplication instance.
   *
   * @return {void} - This method does not return anything.
   */
  public static configure(config?: MetafoksApplicationConfigurationExtra): void {
    MetafoksLogger.configure(config?.logger)

    if (config) {
      MetafoksConfigLoader.configure(config.config)
      MetafoksExtensionsLoader.configure(config.extensions)
      MetafoksApplication.overrideConfigValues(config.overrides)
      MetafoksApplication.shared.scanner.configure(config.scanner)
      MetafoksApplication.shared.container.configure(config.container)
    }
  }

  /**
   * Запускает приложение Metafoks:
   * - Выполняет загрузку конфигурации
   * - Выполняет загрузку (установку) расширений
   * - Выполняет запуск автозагрузки расширений
   */
  public static async startApplication(config?: MetafoksApplicationConfigurationExtra) {
    MetafoksEvents.dispatch('beforeStart')

    MetafoksApplication.configure(config)
    MetafoksConfigLoader.configReadProfiledJSON()
    MetafoksApplication._applicationInjectConfigToContainer()
    MetafoksEvents.dispatch('afterApplicationConfigLoaded', this.configuration)

    MetafoksLogger.loggerEnableForWrite()
    MetafoksLogger.configure(this.configuration.logger)

    await MetafoksApplication.shared.start()

    if (MetafoksExtensionsLoader.extensionsTestModuleEnabled()) {
      MetafoksExtensionsLoader.extensionsInstallToContainer(this.container, this.configuration)
      await MetafoksExtensionsLoader.extensionsStartAutorun(this.container, this.configuration)
    }

    MetafoksEvents.dispatch('beforeApplicationStartCall')
    await MetafoksApplication._applicationInvokeApplicationComponentStart()

    MetafoksApplication._applicationListenClose()
    MetafoksEvents.dispatch('afterStart')
  }

  public static async stopApplication(force: boolean = false) {
    MetafoksEvents.dispatch('beforeClose', force)

    this._logger.debug(`stopping application [force=${force}]`)
    if (MetafoksExtensionsLoader.extensionsTestModuleEnabled()) {
      await MetafoksExtensionsLoader.extensionsClose(force, this.container, this.configuration)
    }
    this._logger.info('application has been stopped')
    MetafoksEvents.dispatch('afterClose')
  }

  private static _configOverrides: MetafoksApplicationConfiguration & MetafoksAppConfig = {}

  /**
   * Логгер приложения
   * @private
   */
  private static readonly _logger = LoggerFactory.create(MetafoksApplication)

  /**
   * Загружает конфигурацию в контекст
   * @private
   */
  private static _applicationInjectConfigToContainer() {
    this.container.set('config', this.configuration)
  }

  /**
   * Invokes the start or run method of the application component.
   *
   * @returns A promise that resolves when the component's start or run method has completed.
   */
  private static async _applicationInvokeApplicationComponentStart() {
    const component = MetafoksApplication.getApplicationComponent()
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

  private static _applicationListenClose() {
    process.once('SIGINT', async () => {
      await this.stopApplication()
    })
    process.once('SIGTERM', async () => {
      await this.stopApplication()
    })
  }

  private readonly _logger = LoggerFactory.create(MetafoksApplication)

  /**
   * Контейнер зависимостей
   */
  public readonly container = new MetafoksContainer('default')

  /**
   * Сканер компонентов
   */
  public readonly scanner = new MetafoksScanner()

  public constructor() {}

  public async start() {
    MetafoksApplication._logger.debug('starting application v2')

    await this._registerConfig()
    await this._registerAutoComponents()
  }

  private async _registerConfig() {
    const config = MetafoksApplication.configuration
    this.container.set('config', config)
  }

  private async _registerAutoComponents() {
    // if (MetafoksApplication.configuration.scanComponents) {
    const components = await this.scanner.scanClassComponents(METAFOKS_CONTEXT_INJECT_COMPONENT)
    for (const component of components) {
      this.container.set(component.tokenName, component.target, component.isMultiple)
    }

    this._logger.info(`registered <${Object.values(components).length}> auto components`)
  }
  // }
}
