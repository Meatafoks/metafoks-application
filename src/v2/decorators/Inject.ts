import { InjectByToken } from './InjectByToken'

export const Inject: PropertyDecorator = (target: Object, propertyKey: string | symbol) => {
  const typeName = Reflect.getMetadata('design:type', target, propertyKey)
  const typeStringName = typeName.prototype.constructor.name

  InjectByToken(typeStringName)(target, propertyKey)
}
