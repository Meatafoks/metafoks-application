export type LoggerLevelValue = 'trace' | 'debug' | 'info' | 'warn' | 'error' | string

export interface MetafoksLoggerConfiguration {
  logsPath?: string
  level?: Record<string, LoggerLevelValue>
  defaultLevel?: LoggerLevelValue
  fileWritingEnabled?: boolean
}
