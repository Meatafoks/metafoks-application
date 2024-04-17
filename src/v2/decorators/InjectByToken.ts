import { MetafoksApplication } from '../../MetafoksApplication'

export function InjectByToken(token: string): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
      get: () => MetafoksApplication.shared.container.getFirst(token),
    })
  }
}
