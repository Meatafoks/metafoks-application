import {
  METAFOKS_CONTEXT_INJECT_COMPONENT,
  METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE,
  METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN,
} from '../idntifiers'

export interface CustomComponentProps {
  multiple?: boolean
  token?: string
}

export function CustomComponent(props: CustomComponentProps): ClassDecorator {
  return function (target: any) {
    const token = props.token ?? target.name
    Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT, true, target)
    Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN, token, target)
    Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE, props.multiple, target)
  }
}
