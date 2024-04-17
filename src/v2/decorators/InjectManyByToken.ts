import { MetafoksApplication } from '../../MetafoksApplication'

export function InjectManyByToken(token: string): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Object.defineProperty(target, propertyKey, {
      get: () => MetafoksApplication.shared.container.getAll(token),
    })
  }
}
