import { MetafoksScannerProperties } from './MetafoksScannerProperties'
import { LoggerFactory } from '@metafoks/logger'
import { glob } from 'glob'
import { ComponentConstructor } from '../types'
import { NodeUtils } from '../utils'
import ts from 'typescript'
import process from 'process'
import { resolve } from 'path'
import { METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE, METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN } from '../idntifiers'

export interface MetafoksScannerResultItem {
  className: string
  tokenName: string
  isMultiple: boolean
  target: ComponentConstructor
}

export class MetafoksScanner {
  private _logger = LoggerFactory.create(MetafoksScanner)

  private _properties: MetafoksScannerProperties = {
    glob: ['/src/**/*.ts'],
    loggerLevel: 'info',
  }

  public constructor(properties?: Partial<MetafoksScannerProperties>) {
    this.configure(properties)
  }

  /**
   * Конфигурирует сканер
   * @param properties
   */
  public configure(properties?: Partial<MetafoksScannerProperties>) {
    if (properties) {
      this._properties = {
        ...this._properties,
        ...properties,
      }
      this._logger.level = this._properties.loggerLevel
      this._logger.info(`configured with properties: <${JSON.stringify(properties)}>`)
    }
  }

  public async scanClassComponents(metaKeyCheck?: string | symbol): Promise<MetafoksScannerResultItem[]> {
    this._logger.info('scanning for components...')
    const files = this._properties.glob.flatMap(value => glob.sync(value))
    const importedObjects: MetafoksScannerResultItem[] = []
    const currentWorkingDir = process.cwd()

    for (const file of files) {
      this._logger.trace(`scanning file: <${file}>`)
      const nodes = NodeUtils.getAnyExportedClassDeclarationNodesFromFile(file)

      // Получаем имена импортов
      const importNames = this._getImportNames(nodes)
      const fullPath = resolve(currentWorkingDir, file)

      if (Object.keys(importNames).length === 0) {
        this._logger.trace(`file <${fullPath}> does not contain any components with decorators`)
        continue
      }

      // Импортируем файл
      this._logger.trace(`importing file: <${fullPath}>`)
      const importedSource = await import(fullPath)

      // Импортируем классы
      for (const [importName, className] of Object.entries(importNames)) {
        this._logger.trace(`importing class: <${className}>`)

        if (metaKeyCheck) {
          const metaKey = Reflect.getMetadata(metaKeyCheck, importedSource[importName])
          if (!metaKey) continue
        }

        const tokenName = Reflect.getMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_TOKEN, importedSource[importName])
        const isMultiple = Reflect.getMetadata(METAFOKS_CONTEXT_INJECT_COMPONENT_MULTIPLE, importedSource[importName])

        importedObjects.push({
          className,
          tokenName,
          isMultiple: isMultiple ?? false,
          target: importedSource[importName],
        })
        this._logger.debug(`imported class: <${tokenName}>`)
      }
    }

    this._logger.info(`found <${Object.keys(importedObjects).length}> components`)
    return importedObjects
  }

  private _testDecorator(decorator: ts.Decorator, name: string) {
    const text = decorator.getText()
    return text.startsWith(name)
  }

  private _getImportNames(nodes: readonly ts.ClassDeclaration[]): Record<string, string> {
    const importNamesMap: Record<string, string> = {}

    for (const node of nodes) {
      const className = NodeUtils.getClassName(node)
      const decorators = NodeUtils.getClassDecorators(node)

      // Если нет декораторов или нет имени класса, то пропускаем
      if (decorators.length <= 0 || !className) continue

      const importName = NodeUtils.isNodeDefaultExported(node) ? 'default' : className
      importNamesMap[importName] = className
      this._logger.trace(`found class: <${className}>`)
    }

    return importNamesMap
  }
}
