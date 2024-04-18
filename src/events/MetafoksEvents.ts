import { LoggerFactory } from '@metafoks/logger'
import { MetafoksEventsMap } from './MetafoksEventsMap'

/**
 * Класс для работы с событиями
 */
export class MetafoksEvents {
  private _logger = LoggerFactory.create(MetafoksEvents)
  private _listeners: Partial<Record<keyof MetafoksEventsMap, Set<any>>> = {}

  /**
   * Добавляет обработчик событий
   *
   * @param event - название события
   * @param handler - обработчик события
   */
  public addEventListener<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
    event: Event,
    handler: Handler,
  ) {
    if (!this._listeners[event]) this._listeners[event] = new Set()
    this._listeners[event]?.add(handler)
    this._logger.debug(`added event listener to event <${event}>`)
  }

  /**
   * Удаляет обработчик событий
   *
   * @param event - название события
   * @param handler - обработчик события
   */
  public removeEventListener<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
    event: Event,
    handler: Handler,
  ) {
    if (!this._listeners[event]) return
    this._listeners[event]?.delete(handler)
    this._logger.debug(`removed event listener from event <${event}>`)
  }

  /**
   * Запускает обработчики событий
   *
   * @param event - название события
   * @param args - аргументы для обработчиков
   */
  public dispatch<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
    event: Event,
    ...args: Parameters<Handler>
  ) {
    if (this._listeners[event]) {
      this._listeners[event]?.forEach(fn => fn.apply(null, args))
    }
  }
}
