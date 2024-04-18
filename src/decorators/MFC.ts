import {
  METAFOKS_CONTEXT_INJECT_COMPONENT,
  METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE,
  METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN,
} from '../idntifiers'
import { MetafoksApplication, MetafoksApplicationConfigurationExtra } from '../MetafoksApplication'

export interface InjectionProps {
  multiple?: boolean
  token?: string
}

export const MFC = {
  CreateComponent(props: InjectionProps): ClassDecorator {
    return function (target: any) {
      const token = props.token ?? target.name
      Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT, true, target)
      Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN, token, target)
      Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE, props.multiple, target)
    }
  },
  CreateApplication(config?: MetafoksApplicationConfigurationExtra): ClassDecorator {
    return function (target: any) {
      MetafoksApplication.shared.setComponent(target)

      if (MetafoksApplication.ignoreDecoratorAutorun) return
      MetafoksApplication.shared.start(config).catch(reason => {
        console.error(reason)
      })
    }
  },
  InjectComponent(props: InjectionProps): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
      const typeName = Reflect.getMetadata('design:type', target, propertyKey)
      const typeStringName = typeName.prototype.constructor.name
      const token = props.token ?? typeStringName

      Object.defineProperty(target, propertyKey, {
        get: () => {
          if (props.multiple) {
            return MetafoksApplication.shared.container.getAll(token)
          } else {
            return MetafoksApplication.shared.container.getFirst(token)
          }
        },
      })
    }
  },
}
