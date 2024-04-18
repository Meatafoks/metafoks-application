import {
  METAFOKS_CONTEXT_INJECT_COMPONENT,
  METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE,
  METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN,
} from '../idntifiers'

export interface ComponentProps {
  multiple?: boolean
  token?: string
}

export const MFC = {
  CreateComponent(props: ComponentProps): ClassDecorator {
    return function (target: any) {
      const token = props.token ?? target.name
      Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT, true, target)
      Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN, token, target)
      Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE, props.multiple, target)
    }
  },
}
