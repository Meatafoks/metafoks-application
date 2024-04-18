import { MetafoksExtensionsLoaderConfiguration } from './MetafoksExtensionsLoaderConfiguration'
import { LoggerFactory } from '@metafoks/logger'
import { merge } from '@metafoks/toolbox'
import { MetafoksExtension } from '../../extionsion'
import { IMetafoksApplicationInstance } from '../../interfaces'

/**
 * Загрузчик расширений
 */
export class MetafoksExtensionsLoader {
  private _logger = LoggerFactory.create(MetafoksExtensionsLoader)
  private _extensions: Record<string, MetafoksExtension<any>> = {}
  private _configuration: MetafoksExtensionsLoaderConfiguration = {
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

  public constructor(private _app: IMetafoksApplicationInstance) {}

  /**
   * Конфигурация загрузчика
   */
  public get configuration(): Readonly<MetafoksExtensionsLoaderConfiguration> {
    return Object.freeze(this._configuration)
  }

  /**
   * Расширения, загруженные в приложение
   */
  public get extensions(): Record<string, MetafoksExtension<any>> {
    return Object.freeze(this._extensions)
  }

  /**
   * Конфигурирует загрузчик расширений
   * @param config
   */
  public configure(config?: Partial<MetafoksExtensionsLoaderConfiguration>) {
    if (config) {
      this._configuration = merge.withOptions({ mergeArrays: false }, this._configuration, config)
      this._logger.info(`changed configuration=${JSON.stringify(config)}`)
    }
  }

  /**
   * Добавляет расширение в систему
   * @param extensions
   */
  public addExtension(...extensions: MetafoksExtension<any>[]) {
    for (const extension of extensions) {
      this._extensions[extension.identifier] = extension
      this._logger.debug(`added extension with identifier = <${extension.identifier}>`)
    }
  }

  public extensionsTestModuleEnabled() {
    if (this._configuration.enabled === false) {
      this._logger.info('[!] extensions module disabled by <config.extensions.enabled = false>')
      return false
    }
    return true
  }

  public extensionTestToInstall(id: string) {
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
  public extensionTestToAutorun(id: string) {
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
  public extensionTestToClose(id: string) {
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
   * @param applicationConfig
   */
  public extensionsInstallToContainer(applicationConfig: any) {
    this._app.events.dispatch('beforeExtensionsInstallPhase')

    if (this._configuration.install?.enabled === false) {
      this._logger.info('[!] extensions installing disabled by <config.extensions.install.enabled = false>')
      return
    }

    this._logger.debug('started extensions installation')
    const extensions = Object.values(this._extensions)

    for (const ext of extensions) {
      if (!ext.install) continue
      this._app.events.dispatch('beforeExtensionInstall', ext.identifier)

      if (!this.extensionTestToInstall(ext.identifier)) continue

      this._logger.debug(`installing extension with identifier <${ext.identifier}>`)

      const config = ext.configProperty ? applicationConfig?.[ext.configProperty] ?? {} : {}
      ext.install(this._app, config)

      this._logger.info(`installed extension with identifier <${ext.identifier}>`)
      this._app.events.dispatch('afterExtensionInstall', ext.identifier)
    }
    this._logger.info('extensions installations done')
    this._app.events.dispatch('afterExtensionsInstallPhase')
  }

  /**
   * Устанавливает расширения в контейнер
   * @param force
   * @param applicationConfig
   */
  public async extensionsClose(force: boolean, applicationConfig: any) {
    this._app.events.dispatch('beforeExtensionsClosePhase', force)

    if (this._configuration.close?.enabled === false) {
      this._logger.info('[!] extensions closing disabled by <config.extensions.close.enabled = false>')
      return
    }

    this._logger.debug('started extensions close phase')
    const extensions = Object.values(this._extensions)

    for (const ext of extensions) {
      if (!ext.close) continue

      this._app.events.dispatch('beforeExtensionClose', ext.identifier)

      if (!this.extensionTestToClose(ext.identifier)) continue

      this._logger.debug(`closing extension with identifier <${ext.identifier}>`)

      const config = ext.configProperty ? applicationConfig?.[ext.configProperty] ?? {} : {}
      await ext.close(this._app, config, force)

      this._logger.info(`closed extension with identifier <${ext.identifier}>`)
      this._app.events.dispatch('afterExtensionClose', ext.identifier)
    }
    this._logger.info('extensions closing phase done')
    this._app.events.dispatch('afterExtensionsClosePhase')
  }

  /**
   * Запускает автозагрузку расширений
   *
   * @param applicationConfig
   */
  public async extensionsStartAutorun(applicationConfig: any) {
    this._app.events.dispatch('beforeExtensionsAutorunPhase')

    if (this._configuration.autorun?.enabled === false) {
      this._logger.info('[!] extensions autorun disabled by <config.extensions.autorun.enabled = false>')
      return
    }

    this._logger.debug('extensions autorun execution phase started')
    const extensions = Object.values(this._extensions)

    for (const ext of extensions) {
      if (!ext.autorun) continue

      this._app.events.dispatch('beforeExtensionAutorun', ext.identifier)

      if (!this.extensionTestToAutorun(ext.identifier)) continue

      this._logger.debug(`starting autorun of extension with identifier = <${ext.identifier}>`)

      const config = ext.configProperty ? applicationConfig?.[ext.configProperty] ?? {} : {}
      await ext.autorun(this._app, config)

      this._logger.info(`completed autorun of extension with identifier = <${ext.identifier}>`)
      this._app.events.dispatch('afterExtensionAutorun', ext.identifier)
    }
    this._logger.info('extensions autorun execution phase done')
    this._app.events.dispatch('afterExtensionsAutorunPhase')
  }
}
