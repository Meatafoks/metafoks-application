import { MetafoksExtensionsLoaderConfiguration } from './MetafoksExtensionsLoaderConfiguration'
import { LoggerFactory } from '@metafoks/logger'
import { merge } from '@metafoks/toolbox'
import { MetafoksExtension } from '../../extionsion'
import { Container } from '@metafoks/context'
import { MetafoksEvents } from '../../events'

/**
 * Загрузчик расширений
 */
export class MetafoksExtensionsLoader {
  /**
   * Конфигурация загрузчика
   */
  public static get configuration(): Readonly<MetafoksExtensionsLoaderConfiguration> {
    return Object.freeze(MetafoksExtensionsLoader._configuration)
  }

  /**
   * Расширения, загруженные в приложение
   */
  public static get extensions(): Record<string, MetafoksExtension<any>> {
    return Object.freeze(MetafoksExtensionsLoader._extensions)
  }

  /**
   * Конфигурирует загрузчик расширений
   * @param config
   */
  public static configure(config?: Partial<MetafoksExtensionsLoaderConfiguration>) {
    if (config) {
      this._configuration = merge.withOptions({ mergeArrays: false }, this._configuration, config)
      this._logger.info(`changed configuration=${JSON.stringify(config)}`)
    }
  }

  /**
   * Добавляет расширение в систему
   * @param extensions
   */
  public static addExtension(...extensions: MetafoksExtension<any>[]) {
    for (const extension of extensions) {
      this._extensions[extension.identifier] = extension
      this._logger.debug(`added extension with identifier = <${extension.identifier}>`)
    }
  }

  /**
   * Устанавливает расширения в контейнер
   * @param container
   * @param applicationConfig
   */
  public static extensionsInstallToContainer(container: typeof Container, applicationConfig: any) {
    MetafoksEvents.dispatch('beforeExtensionsInstallPhase')

    if (this._configuration.enabled === false) {
      this._logger.info('[!] extensions module disabled by <config.extensions.enabled = false>')
      return
    }

    this._logger.debug('started extensions installation')
    const extensions = Object.values(this._extensions)

    for (const ext of extensions) {
      if (ext.install) {
        MetafoksEvents.dispatch('beforeExtensionInstall', ext.identifier)
        this._logger.debug(`installing extension with identifier <${ext.identifier}>`)

        ext.install(container, applicationConfig)

        this._logger.info(`installed extension with identifier <${ext.identifier}>`)
        MetafoksEvents.dispatch('afterExtensionInstall', ext.identifier)
      }
    }
    this._logger.info('extensions installations done')
    MetafoksEvents.dispatch('afterExtensionsInstallPhase')
  }

  /**
   * Запускает автозагрузку расширений
   *
   * @param container
   * @param applicationConfig
   */
  public static async extensionsStartAutorun(container: typeof Container, applicationConfig: any) {
    MetafoksEvents.dispatch('beforeExtensionsAutorunPhase')

    if (this._configuration.autorun?.enabled === false) {
      this._logger.info('[!] extensions autorun disabled by <config.extensions.autorun.enabled = false>')
      return
    }

    this._logger.debug('extensions autorun execution phase started')
    const extensions = Object.values(this._extensions)

    for (const ext of extensions) {
      if (ext.autorun) {
        if (this._configuration.autorun?.exclude?.includes(ext.identifier)) {
          this._logger.info(
            `[!] extension <${ext.identifier}> autorun disabled by <config.extensions.autorun.exclude = [...]>`,
          )
          continue
        }

        MetafoksEvents.dispatch('beforeExtensionAutorun', ext.identifier)
        this._logger.debug(`starting autorun of extension with identifier = <${ext.identifier}>`)

        await ext.autorun(container, applicationConfig)

        this._logger.debug(`completed autorun of extension with identifier = <${ext.identifier}>`)
        MetafoksEvents.dispatch('afterExtensionAutorun', ext.identifier)
      }
    }
    this._logger.info('extensions autorun execution phase done')
    MetafoksEvents.dispatch('afterExtensionsAutorunPhase')
  }

  private static _logger = LoggerFactory.create(MetafoksExtensionsLoader)
  private static _extensions: Record<string, MetafoksExtension<any>> = {}
  private static _configuration: MetafoksExtensionsLoaderConfiguration = {
    enabled: true,
    autorun: {
      enabled: true,
      exclude: [],
    },
  }

  static {
    MetafoksExtensionsLoader._logger.level = 'debug'
  }
}
