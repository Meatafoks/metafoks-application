import { MFC } from './MFC'

/**
 * Создает приложение Metafoks
 *
 * @param target
 * @constructor
 */
export function Application(target: any) {
  MFC.CreateApplication()(target)
}
