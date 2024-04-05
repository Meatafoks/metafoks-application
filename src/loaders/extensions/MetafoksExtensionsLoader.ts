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

  public static extensionsTestModuleEnabled() {
    if (this._configuration.enabled === false) {
      this._logger.info('[!] extensions module disabled by <config.extensions.enabled = false>')
      return false
    }
    return true
  }

  public static extensionTestToInstall(id: string) {
    if (this._configuration.blacklist?.includes(id)) {
      this._logger.info(`[!] extension <${id}> install disabled by <config.extensions.blacklist = [...]>`)
      return false
    }

    if (this._configuration.install?.exclude?.includes(id)) {
      this._logger.info(`[!] extension <${id}> install disabled by <config.extensions.install.exclude = [...]>`)
      return false
    }
    return true
  }
  public static extensionTestToAutorun(id: string) {
    if (this._configuration.blacklist?.includes(id)) {
      this._logger.info(`[!] extension <${id}> autorun disabled by <config.extensions.blacklist = [...]>`)
      return false
    }

    if (this._configuration.autorun?.exclude?.includes(id)) {
      this._logger.info(`[!] extension <${id}> autorun disabled by <config.extensions.autorun.exclude = [...]>`)
      return false
    }
    return true
  }
  public static extensionTestToClose(id: string) {
    if (this._configuration.blacklist?.includes(id)) {
      this._logger.info(`[!] extension <${id}> closing disabled by <config.extensions.blacklist = [...]>`)
      return false
    }

    if (this._configuration.close?.exclude?.includes(id)) {
      this._logger.info(`[!] extension <${id}> closing disabled by <config.extensions.close.exclude = [...]>`)
      return false
    }
    return true
  }

  /**
   * Устанавливает расширения в контейнер
   * @param container
   * @param applicationConfig
   */
  public static extensionsInstallToContainer(container: typeof Container, applicationConfig: any) {
    MetafoksEvents.dispatch('beforeExtensionsInstallPhase')

    if (this._configuration.install?.enabled === false) {
      this._logger.info('[!] extensions installing disabled by <config.extensions.install.enabled = false>')
      return
    }

    this._logger.debug('started extensions installation')
    const extensions = Object.values(this._extensions)

    for (const ext of extensions) {
      if (ext.install) {
        MetafoksEvents.dispatch('beforeExtensionInstall', ext.identifier)

        if (!this.extensionTestToInstall(ext.identifier)) continue

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
   * Устанавливает расширения в контейнер
   * @param force
   * @param container
   * @param applicationConfig
   */
  public static async extensionsClose(force: boolean, container: typeof Container, applicationConfig: any) {
    MetafoksEvents.dispatch('beforeExtensionsClosePhase', force)

    if (this._configuration.close?.enabled === false) {
      this._logger.info('[!] extensions closing disabled by <config.extensions.close.enabled = false>')
      return
    }

    this._logger.debug('started extensions close phase')
    const extensions = Object.values(this._extensions)

    for (const ext of extensions) {
      if (ext.close) {
        MetafoksEvents.dispatch('beforeExtensionClose', ext.identifier)

        if (!this.extensionTestToClose(ext.identifier)) continue

        this._logger.debug(`closing extension with identifier <${ext.identifier}>`)

        await ext.close(force, container, applicationConfig)

        this._logger.info(`closed extension with identifier <${ext.identifier}>`)
        MetafoksEvents.dispatch('afterExtensionClose', ext.identifier)
      }
    }
    this._logger.info('extensions closing phase done')
    MetafoksEvents.dispatch('afterExtensionsClosePhase')
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
        MetafoksEvents.dispatch('beforeExtensionAutorun', ext.identifier)

        if (!this.extensionTestToAutorun(ext.identifier)) continue

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
    install: {
      enabled: true,
      exclude: [],
    },
    close: {
      enabled: true,
      exclude: [],
    },
    blacklist: [],
  }
}
