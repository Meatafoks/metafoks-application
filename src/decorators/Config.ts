import { RawAutowire } from '@metafoks/context'
import { MetafoksApplication, MetafoksApplicationConfiguration } from '../MetafoksApplication'
import { LoggerLevelValue } from '../loaders'

export const Config = RawAutowire('config')

export function Configure(configuration: Partial<MetafoksApplicationConfiguration>): ClassDecorator {
  MetafoksApplication.configure(configuration)
  return () => {}
}

export function Profile(profile?: string): ClassDecorator {
  return Configure({
    config: {
      profile,
    },
  })
}

export function Override(config: MetafoksApplicationConfiguration & MetafoksAppConfig): ClassDecorator {
  MetafoksApplication.overrideConfigValues(config)
  return () => {}
}

export function LoggerLevel(level: LoggerLevelValue): ClassDecorator
export function LoggerLevel(category: string, level: LoggerLevelValue): ClassDecorator
export function LoggerLevel(keyOfLevel: string | LoggerLevelValue, level?: LoggerLevelValue): ClassDecorator {
  if (keyOfLevel && level) {
    return Configure({
      logger: {
        level: {
          [keyOfLevel]: level,
        },
      },
    })
  } else {
    return Configure({
      logger: {
        defaultLevel: keyOfLevel,
      },
    })
  }
}
