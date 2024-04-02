import { MetafoksExtension } from '../extionsion'
import { MetafoksApplication } from '../MetafoksApplication'

export function Extensions(...extensions: MetafoksExtension<any>[]): ClassDecorator {
  MetafoksApplication.extensions.push(...extensions)
  return () => {}
}
export const With = Extensions
