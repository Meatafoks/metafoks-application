import { LoggerFactory } from '@metafoks/logger'
import { MetafoksApplicationConfiguration } from '../MetafoksApplication'

export interface MetafoksEventsMap {
  beforeStart: () => void
  afterStart: () => void

  beforeApplicationStartCall: () => void

  afterApplicationConfigLoaded: (config: MetafoksApplicationConfiguration & MetafoksAppConfig) => void

  beforeExtensionsInstallPhase: () => void
  afterExtensionsInstallPhase: () => void

  beforeExtensionInstall: (identifier: string) => void
  afterExtensionInstall: (identifier: string) => void

  beforeExtensionsAutorunPhase: () => void
  afterExtensionsAutorunPhase: () => void

  beforeExtensionAutorun: (identifier: string) => void
  afterExtensionAutorun: (identifier: string) => void
}

export class MetafoksEvents {
  /**
   * Добавляет обработчик событий
   * @param event
   * @param handler
   */
  public static addEventListener<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
    event: Event,
    handler: Handler,
  ) {
    if (!this._listeners[event]) this._listeners[event] = new Set()
    this._listeners[event]?.add(handler)
    this._logger.debug(`added event listener to event <${event}>`)
  }

  /**
   * Удаляет обработчик событий
   * @param event
   * @param handler
   */
  public static removeEventListener<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
    event: Event,
    handler: Handler,
  ) {
    if (!this._listeners[event]) return
    this._listeners[event]?.delete(handler)
    this._logger.debug(`removed event listener from event <${event}>`)
  }

  /**
   * Запускает обработчики событий
   * @param event
   * @param args
   */
  public static dispatch<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
    event: Event,
    ...args: Parameters<Handler>
  ) {
    if (this._listeners[event]) {
      this._listeners[event]?.forEach(fn => fn.apply(null, args))
    }
  }

  private static _logger = LoggerFactory.create(MetafoksEvents)
  private static _listeners: Partial<Record<keyof MetafoksEventsMap, Set<any>>> = {}

  static {
    this._logger.level = 'debug'
  }
}
