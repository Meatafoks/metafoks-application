import { MetafoksConfigReader, MetafoksConfigReaderConfiguration } from '@metafoks/config-reader'
import { LoggerFactory } from '@metafoks/application-logger'
import { Container } from '@metafoks/context'
import { Constructable } from 'typedi/types/types/constructable.type'
import { AbstractConstructable } from 'typedi/types/types/abstract-constructable.type'
import { Token } from 'typedi/types/token.class'
import { MetafoksExtension } from './extionsion'
import { merge } from '@metafoks/toolbox'
import { MetafoksApplicationComponentIdentifier } from './identify'
import { MetafoksApplicationTarget } from './interfaces'

export interface MetafoksApplicationConfiguration {
  profile?: string
  configReader: Partial<Omit<MetafoksConfigReaderConfiguration, 'profile'>>
}

export class MetafoksApplication {
  /**
   * Логгер приложения
   * @private
   */
  private static readonly _logger = LoggerFactory.create(MetafoksApplication)

  /**
   * Metafoks configReader
   * @private
   */
  private static readonly _configReader = new MetafoksConfigReader()

  /**
   * Контейнер зависимостей (модулей)
   */
  public static container = Container

  /**
   * Конфигурация приложения
   */
  public static applicationConfig: any = {}

  /**
   * Конфигурация Metafoks Application
   */
  public static configuration: MetafoksApplicationConfiguration = {
    profile: undefined,
    configReader: {
      configsPath: 'config',
    },
  }

  static {
    MetafoksApplication._logger.level = 'debug'
  }

  /**
   * Расширения приложения.
   * Могут быть добавлены через декоратор @With(...)
   *
   * Данный массив используется при загрузке приложения - инициализации расширений
   */
  public static extensions: MetafoksExtension<any>[] = []

  /**
   * Boolean variable indicating whether the decorator autorun should be ignored.
   *
   * Если установлено true, декоратор @Application не будет выполнять запуск приложения
   *
   *
   * @type {boolean}
   */
  public static ignoreDecoratorAutorun: boolean = process.env.METAFOKS_DISABLE_APP_AUTORUN === 'true'

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
  public static configure(config: Partial<MetafoksApplicationConfiguration>): void {
    MetafoksApplication._logger.info(`configuration changed=${JSON.stringify(config)}`)
    MetafoksApplication.configuration = merge(MetafoksApplication.configuration, config) as any
    MetafoksApplication._configReader.configure({
      profile: this.configuration.profile,
      ...this.configuration.configReader,
    })
  }

  /**
   * Запускает приложение Metafoks:
   * - Выполняет загрузку конфигурации
   * - Выполняет загрузку (установку) расширений
   * - Выполняет запуск автозагрузки расширений
   */
  public static async startApplication(props?: { overrideApplicationConfig?: any }) {
    MetafoksApplication.applicationInjectConfigToContainer(props)
    MetafoksApplication.applicationInstallExtensions()

    await MetafoksApplication.applicationRunAutorunExtensions()
    await MetafoksApplication.applicationInvokeApplicationComponentStart()
  }

  /**
   * Устанавливает расширения в приложение Metafoks Application
   * @private
   */
  private static applicationInstallExtensions() {
    this._logger.debug('installing extensions')
    for (const ext of this.extensions) {
      if (ext.install) {
        this._logger.debug(`installing extension: ${ext.identifier}`)

        ext.install(Container, MetafoksApplication.applicationConfig)
        this._logger.info(`installed extension: ${ext.identifier}`)
      }
    }
    this._logger.info('installed extensions')
  }

  /**
   * Загружает конфигурацию в контекст
   * @private
   */
  private static applicationInjectConfigToContainer(props?: { overrideApplicationConfig?: any }) {
    MetafoksApplication._logger.debug('loading configuration')
    MetafoksApplication.applicationConfig = MetafoksApplication._configReader.getConfigActiveProfileContent()

    if (props && props.overrideApplicationConfig) {
      MetafoksApplication.applicationConfig = merge(
        MetafoksApplication.applicationConfig,
        props.overrideApplicationConfig,
      )
    }

    this.container.set('config', MetafoksApplication.applicationConfig)
    MetafoksApplication._logger.info('loaded configuration')
  }

  /**
   * Invokes the start or run method of the application component.
   *
   * @returns A promise that resolves when the component's start or run method has completed.
   */
  private static async applicationInvokeApplicationComponentStart() {
    const component = MetafoksApplication.getApplicationComponent()
    if ('start' in component) {
      await component.start()
      return
    }
    if ('run' in component) {
      await component.run()
      return
    }
  }

  private static async applicationRunAutorunExtensions() {
    MetafoksApplication._logger.debug('running autorun of extensions')
    for (const ext of MetafoksApplication.extensions) {
      if (ext.autorun) {
        MetafoksApplication._logger.debug(`starting autorun of extension: ${ext.identifier}`)

        await ext.autorun(MetafoksApplication.container, MetafoksApplication.applicationConfig)
        MetafoksApplication._logger.info(`completed autorun of extension: ${ext.identifier}`)
      }
    }
    MetafoksApplication._logger.info('completed autorun of extensions')
  }
}
