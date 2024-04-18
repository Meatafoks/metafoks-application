import { IMetafoksApplicationInstance } from '../interfaces'

/**
 * Расширение Metafoks
 * @template TConfig Тип конфигурации расширения
 */
export interface MetafoksExtension<TConfig> {
  /**
   * Идентификатор расширения
   */
  identifier: string

  /**
   * Имя свойства конфигурации приложения, которое будет использоваться для конфигурирования расширения
   */
  configProperty?: string

  /**
   * Жизненный цикл расширения - установка. Данный метод вызывается при установке расширения в приложение.
   *
   * @param app Приложение
   * @param config Конфигурация расширения
   */
  install?: (app: IMetafoksApplicationInstance, config: TConfig) => void

  /**
   * Жизненный цикл расширения - автозапуск. Данный метод вызывается при автозапуске расширения в приложении.
   * Данный метод вызывается после всех установок расширений.
   *
   * @param app Приложение
   * @param config Конфигурация расширения
   */
  autorun?: (app: IMetafoksApplicationInstance, config: TConfig) => void | Promise<void>

  /**
   * Жизненный цикл расширения - закрытие. Данный метод вызывается при закрытии приложения.
   *
   * @param app Приложение
   * @param config Конфигурация расширения
   * @param force Флаг принудительного закрытия
   */
  close?: (app: IMetafoksApplicationInstance, config: TConfig, force?: boolean) => void | Promise<void>
}
