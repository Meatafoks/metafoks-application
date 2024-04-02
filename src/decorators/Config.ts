import { RawAutowire } from '@metafoks/context'
import { MetafoksApplication, MetafoksApplicationConfiguration } from '../MetafoksApplication'

export const Config = RawAutowire('config')

export function Configure(configuration: Partial<MetafoksApplicationConfiguration>): ClassDecorator {
  MetafoksApplication.configure(configuration)
  return () => {}
}

export function Profile(profile?: string): ClassDecorator {
  return Configure({ profile })
}
