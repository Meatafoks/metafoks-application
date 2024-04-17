import { InjectByToken } from './InjectByToken'
import { Inject } from './Inject'

export interface AutoInjectFn {
  (target: Object, propertyKey: string | symbol): void
  (token: string): PropertyDecorator
  (): PropertyDecorator
}

/**
 * Подключает зависимость к свойству класса.
 * Если передана строка, то она будет использована как токен.
 * @param target Объект, в который будет инжектирована зависимость.
 * @param propertyKey Ключ свойства, в которое будет инжектирована зависимость.
 * @returns {void | PropertyDecorator}
 */
export const AutoInject = <AutoInjectFn>((target?: Object | string, propertyKey?: string | symbol) => {
  if (target === undefined) {
    return Inject
  }

  if (typeof target === 'string') {
    return InjectByToken(target)
  }

  const type = Reflect.getMetadata('design:type', target, propertyKey!)

  Inject(target, propertyKey!)
})
