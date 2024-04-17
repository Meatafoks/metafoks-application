import {
  METAFOKS_CONTEXT_INJECT_COMPONENT,
  METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE,
  METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN,
} from '../idntifiers'
import { ComponentConstructor } from '../types'

export function AutoComponent<T extends ComponentConstructor>(target: T) {
  const targetName = target.name
  Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN, targetName, target)
  Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT, true, target)
  Reflect.defineMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE, false, target)
}
