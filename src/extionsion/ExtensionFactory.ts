import { MetafoksExtension } from './MetafoksExtension'
import { _repackExtension } from './_repackExtension'

/**
 * Фабрика для создания расширений.
 *
 * Ее необходимо использовать, чтобы создать красивый вид расширения для подключения в приложение.
 * Подключение будет выглядеть как ```@With(Component.extension)``` или же с дополнительной конфигурацией ```@With(Component.extension.configure(config))```.
 */
export class ExtensionFactory {
  /**
   * Функция создания расширения.
   * @param extension
   * @returns расширение с методами configure, install, autorun, close, идентификатором и свойством конфигурации.
   *
   * Пример использования:
   *
   * ```typescript
   * const extension = ExtensionFactory.create({
   *    identifier: 'com.extension.test.id',
   *    install: (app, config) => {
   *      console.log('install', config)
   *    },
   *    autorun: (app, config) => {
   *      console.log('autorun', config)
   *    },
   *    close: (app, config, force) => {
   *      console.log('close', config, force)
   *    },
   *  })
   *  ```
   *
   */
  public static create<TConfig>(extension: MetafoksExtension<TConfig>) {
    return {
      // Функция конфигурации расширения
      configure(config: TConfig) {
        return _repackExtension(extension, config)
      },

      // Основные методы расширения
      ..._repackExtension(extension),
    }
  }
}
