import { MetafoksLoggerConfiguration } from './MetafoksLoggerConfiguration'
import { LoggerFactory } from '@metafoks/logger'
import { merge } from '@metafoks/toolbox'
import { Appender } from 'log4js'

export class MetafoksLogger {
  public static get configuration(): Readonly<MetafoksLoggerConfiguration> {
    return Object.freeze(this._configuration)
  }

  public static configure(config: MetafoksLoggerConfiguration = {}) {
    this._configuration = merge(this._configuration, config)
    this._configureLogger(this._configuration)
  }

  public static loggerEnableForWrite() {
    this._canWrite = true
  }

  private static _canWrite = false
  private static _logger = LoggerFactory.create(MetafoksLogger)

  private static _configuration: MetafoksLoggerConfiguration = {
    logsPath: 'logs',
    defaultLevel: 'info',
    fileWritingEnabled: true,
  }

  private static _configureLogger(config: MetafoksLoggerConfiguration) {
    const appenders: { [name: string]: Appender } = {
      out: { type: 'stdout' },
    }

    const categories: {
      [name: string]: {
        appenders: string[]
        level: string
        enableCallStack?: boolean
      }
    } = {}

    const customLevels = config.level ?? {}

    if (config.fileWritingEnabled && this._canWrite) {
      appenders['file'] = { type: 'file', filename: `${config.logsPath}/logs.log` }
      categories['default'] = { appenders: ['file', 'out'], level: config.defaultLevel ?? 'info' }

      Object.keys(customLevels).forEach(category => {
        categories[category] = { appenders: ['file', 'out'], level: customLevels[category] }
      })
    } else {
      categories['default'] = { appenders: ['out'], level: config.defaultLevel ?? 'info' }

      Object.keys(customLevels).forEach(category => {
        categories[category] = { appenders: ['out'], level: customLevels[category] }
      })
    }

    LoggerFactory.configure({ appenders, categories })
  }
}
