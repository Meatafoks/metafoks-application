import { NodeUtils } from '../../src'

describe('getAllNodesFromFile', () => {
  const file = __dirname + '/testFile.ts'

  it('should work', () => {
    const nodes = NodeUtils.getAllNodesFromFile(file)
    expect(nodes.length).toBeGreaterThan(0)
  })

  it('should return class nodes', () => {
    const nodes = NodeUtils.getClassDeclarationNodesFromFile(file)
    expect(nodes.length).toBe(2)
  })

  it('should return class decorators', () => {
    const nodes = NodeUtils.getClassDeclarationNodesFromFile(file)
    const decorators = NodeUtils.getClassDecorators(nodes[0])
    for (const decorator of decorators) {
      console.log(decorator.getText())
    }
    expect(decorators.length).toBe(2)
  })

  it('should return default export', () => {
    const nodes = NodeUtils.getAllNodesFromFile(file)
    for (const node of nodes) {
      console.log(node.getText(), NodeUtils.isNodeExported(node), NodeUtils.isNodeDefaultExported(node))
    }
    expect(nodes.some(value => NodeUtils.isNodeDefaultExported(value))).toBe(true)
  })

  it('should return exported class nodes', () => {
    const nodes = NodeUtils.getAnyExportedClassDeclarationNodesFromFile(file)
    expect(nodes.length).toBe(2)
  })

  it('should return class name', () => {
    const nodes = NodeUtils.getClassDeclarationNodesFromFile(file)

    const name = NodeUtils.getClassName(nodes[0])
    const name1 = NodeUtils.getClassName(nodes[1])

    expect(name).toBe('TestClass')
    expect(name1).toBe('TestDefaultClass')
  })
})
