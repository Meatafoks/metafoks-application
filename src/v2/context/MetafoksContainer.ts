import { LoggerFactory } from '@metafoks/logger'
import { MetafoksContainerToken } from './MetafoksContainerToken'
import { MetafoksContainerProperties } from './MetafoksContainerProperties'
import { MetafoksContainerComponent, MetafoksContainerEntity } from './MetafoksContainerEntity'
import { ComponentConstructor } from '../types'
import { ComponentNotFoundError } from '../errors'

export class MetafoksContainer {
  private _logger = LoggerFactory.create(MetafoksContainer)
  private _container: Record<MetafoksContainerToken, MetafoksContainerEntity[]> = {}
  private _cache: Record<MetafoksContainerToken, MetafoksContainerComponent[]> = {}

  private _properties: MetafoksContainerProperties = {
    loggerLevel: 'info',
  }

  public constructor(
    private _name: string,
    properties?: Partial<MetafoksContainerProperties>,
  ) {
    this.configure(properties)
  }

  public configure(properties?: Partial<MetafoksContainerProperties>) {
    if (properties) {
      this._properties = { ...this._properties, ...properties }
      this._logger.level = this._properties.loggerLevel

      this._logger.info(`configure container <${this._name}> with properties <${JSON.stringify(this._properties)}>`)
    }
  }

  /**
   * Возвращает первый элемент из контейнера по токену
   * @param token - токен
   */
  public getFirst<T>(token: MetafoksContainerToken): T | undefined {
    this.createCache(token)
    return this._cache[token]?.[0] as T
  }

  /**
   * Возвращает все элементы из контейнера по токену
   * @param token - токен
   */
  public getAll<T>(token: MetafoksContainerToken): T[] {
    this.createCache(token)
    return (this._cache[token] as T[]) ?? []
  }

  /**
   * Устанавливает элемент в контейнер по токену
   * @param token - токен
   * @param component - компонент
   * @param multiple - флаг, указывающий на возможность добавления нескольких элементов
   */
  public set(token: MetafoksContainerToken, component: MetafoksContainerEntity, multiple = false) {
    if (!this._container[token]) {
      this._container[token] = []
    }
    if (!multiple) {
      this._logger.trace(`set component to container <${this._name}> with token <${JSON.stringify(token)}>`)
      this._container[token] = [component]
      return
    }

    this._logger.trace(`push component to container <${this._name}> with token <${JSON.stringify(token)}>`)
    this._container[token].push(component)
  }

  /**
   * Удаляет элемент из контейнера по токену
   * @param token
   */
  public clear(token: MetafoksContainerToken) {
    this._container[token] = []
    this._cache[token] = []
    this._logger.info(`clear container <${this._name}> with token <${JSON.stringify(token)}>`)
  }

  /**
   * Удаляет все элементы из контейнера
   */
  public clearAll() {
    this._container = {}
    this._cache = {}
    this._logger.info(`clear all container <${this._name}>`)
  }

  /**
   * Возвращает все данные контейнера в виде только для чтения
   */
  public getContainerDataReadonly(): Readonly<Record<MetafoksContainerToken, MetafoksContainerEntity[]>> {
    return Object.freeze(this._container)
  }

  public getCacheDataReadonly(): Readonly<Record<MetafoksContainerToken, MetafoksContainerComponent[]>> {
    return Object.freeze(this._cache)
  }

  public createCache(token: MetafoksContainerToken) {
    if (!this._container[token]) {
      this._logger.warn(`container <${this._name}> has no token <${String(token)}>`)
      throw new ComponentNotFoundError(this._name, token)
    }

    this._cache[token] = this._container[token].map(entity => {
      if (typeof entity === 'function') {
        return new (entity as ComponentConstructor)()
      }
      return entity
    })
  }
}
