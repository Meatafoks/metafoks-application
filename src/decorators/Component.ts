import { ComponentConstructor } from '../types'
import { MFC } from './MFC'

/**
 * Регистрирует компонент в контейнере
 *
 * @param target
 * @constructor
 */
export function Component<T extends ComponentConstructor>(target: T) {
  MFC.CreateComponent({ token: target.name, multiple: false })(target)
}

export const Service = Component
