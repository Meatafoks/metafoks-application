import { ComponentConstructor } from '../types'
import { MFC } from './MFC'

export function AutoComponent<T extends ComponentConstructor>(target: T) {
  MFC.CreateComponent({ token: target.name, multiple: false })(target)
}
