import { Bindable } from '../interfaces'
import { Container } from '@metafoks/context'

export interface BindingConstructor<T> {
  new (): T
}

export function Bind<BindType, T extends Bindable<BindType>>(CfgType: BindingConstructor<T>) {
  return (target: any, property: any, index?: any) => {
    Container.registerHandler({
      object: target,
      propertyName: property,
      index: index,
      value: container => {
        return container.get<T>(CfgType).getValue()
      },
    })
  }
}
