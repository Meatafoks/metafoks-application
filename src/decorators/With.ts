import { MetafoksExtension } from '../extionsion'
import { MetafoksExtensionsLoader } from '../loaders/extensions'

export function Extensions(...extensions: MetafoksExtension<any>[]): ClassDecorator {
  MetafoksExtensionsLoader.addExtension(...extensions)
  return () => {}
}
export const With = Extensions
