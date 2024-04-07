import { MetafoksExtension } from './MetafoksExtension'
import { repackExtension } from './RepackExtension'

/**
 * Фабрика для создания расширений.
 */
export class ExtensionFactory {
  /**
   * Функция создания расширения.
   * @param extension
   */
  public static create<TConfig>(extension: MetafoksExtension<TConfig>) {
    return {
      configure(config: TConfig) {
        return repackExtension(extension, config)
      },
      ...repackExtension(extension),
    }
  }
}
