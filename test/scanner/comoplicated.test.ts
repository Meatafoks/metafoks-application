import { ComponentConstructor, NodeUtils } from '../../src'

describe('complicated nodes tes', () => {
  const file = __dirname + '/testFile.ts'

  it('should find class with decorator, import it and get metadata', async () => {
    const nodes = NodeUtils.getClassDeclarationNodesFromFile(file)
    const nodesClassNames = nodes.map(value => NodeUtils.getClassName(value))
    const requirements: Record<string, string> = {}

    for (const node of nodes) {
      const decorators = NodeUtils.getClassDecorators(node)
      const className = NodeUtils.getClassName(node)

      if (decorators.length <= 0 || !className) continue

      if (NodeUtils.isNodeDefaultExported(node)) {
        requirements.default = className
      } else if (NodeUtils.isNodeExported(node)) {
        requirements[className] = className
      }
    }

    const objs = await import(file)
    const importedObjects: Record<string, ComponentConstructor<any>> = {}
    for (const [importName, className] of Object.entries(requirements)) {
      importedObjects[className] = objs[importName]
    }

    const my = Reflect.getMetadata('my', importedObjects.TestClass)
    const mego = Reflect.getMetadata('mego', importedObjects.TestClass)

    const my1 = Reflect.getMetadata('my', importedObjects.TestDefaultClass)
    const mego1 = Reflect.getMetadata('mego', importedObjects.TestDefaultClass)

    expect(my).toBe('all 0')
    expect(mego).toBe('all 1')
    expect(my1).toBe('all 0')
    expect(mego1).toBe(undefined)
  })
})
