import { MetafoksExtension } from '../extionsion'
import { MetafoksExtensionsLoader } from '../loaders'

export function Extensions(...extensions: MetafoksExtension<any>[]): ClassDecorator {
  MetafoksExtensionsLoader.addExtension(...extensions)
  return () => {}
}
export const With = Extensions
