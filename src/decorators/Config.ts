import { MetafoksApplication, MetafoksApplicationConfiguration } from '../MetafoksApplication'
import { LoggerLevelValue } from '../loaders'
import { MFC } from './MFC'

export const Config = MFC.InjectComponent({ token: 'config' })

export function Configure(configuration: Partial<MetafoksApplicationConfiguration>): ClassDecorator {
  MetafoksApplication.shared.configure(configuration)
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
  MetafoksApplication.shared.overrideConfigValues(config)
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
