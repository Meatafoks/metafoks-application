import { MetafoksApplicationConfiguration } from '../MetafoksApplication'

export interface MetafoksEventsMap {
  /**
   * Вызывается перед запуском приложения
   */
  beforeStart: () => void

  /**
   * Вызывается после запуска приложения
   */
  afterStart: () => void

  /**
   * Вызывается перед закрытием приложения
   * @param force - флаг принудительного закрытия
   */
  beforeClose: (force: boolean) => void

  /**
   * Вызывается после закрытия приложения
   */
  afterClose: () => void

  /**
   * Вызывается перед вызовом метода `start` приложения
   */
  beforeApplicationStartCall: () => void

  /**
   * Вызывается после загрузки конфигурации приложения
   * @param config - конфигурация приложения
   */
  afterApplicationConfigLoaded: (config: MetafoksApplicationConfiguration & MetafoksAppConfig) => void

  /**
   * Вызывается перед установкой расширений
   */
  beforeExtensionsInstallPhase: () => void

  /**
   * Вызывается после установки расширений
   */
  afterExtensionsInstallPhase: () => void

  /**
   * Вызывается перед установкой расширения
   * @param identifier - идентификатор расширения
   */
  beforeExtensionInstall: (identifier: string) => void

  /**
   * Вызывается после установки расширения
   * @param identifier - идентификатор расширения
   */
  afterExtensionInstall: (identifier: string) => void

  /**
   * Вызывается перед запуском расширений
   */
  beforeExtensionsAutorunPhase: () => void

  /**
   * Вызывается после запуска расширений
   */
  afterExtensionsAutorunPhase: () => void

  /**
   * Вызывается перед запуском расширения
   * @param identifier - идентификатор расширения
   */
  beforeExtensionAutorun: (identifier: string) => void

  /**
   * Вызывается после запуска расширения
   * @param identifier - идентификатор расширения
   */
  afterExtensionAutorun: (identifier: string) => void

  /**
   * Вызывается перед закрытием расширений
   * @param force - флаг принудительного закрытия
   */
  beforeExtensionsClosePhase: (force: boolean) => void

  /**
   * Вызывается после закрытия расширений
   */
  afterExtensionsClosePhase: () => void

  /**
   * Вызывается перед закрытием расширения
   * @param identifier - идентификатор расширения
   */
  beforeExtensionClose: (identifier: string) => void

  /**
   * Вызывается после закрытия расширения
   * @param identifier - идентификатор расширения
   */
  afterExtensionClose: (identifier: string) => void
}
