import ts from 'typescript'
import fs from 'fs'

export class NodeUtils {
  /**
   * Возвращает true, если нод является классом
   * @param node
   */
  public static isClassDeclaration(node: ts.Node): node is ts.ClassDeclaration {
    return node.kind === ts.SyntaxKind.ClassDeclaration
  }

  /**
   * Возвращает массив всех нодов из файла
   * @param filePath
   */
  public static getAllNodesFromFile(filePath: string): readonly ts.Node[] {
    const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath).toString(), ts.ScriptTarget.Latest, true)
    const nodes: ts.Node[] = []
    ts.forEachChild(sourceFile, node => {
      nodes.push(node)
    })
    return nodes
  }

  /**
   * Возвращает массив всех нодов из файла
   * @param filePath
   */
  public static getClassDeclarationNodesFromFile(filePath: string): readonly ts.ClassDeclaration[] {
    const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath).toString(), ts.ScriptTarget.Latest, true)
    const nodes: ts.ClassDeclaration[] = []
    ts.forEachChild(sourceFile, node => {
      if (NodeUtils.isClassDeclaration(node)) nodes.push(node)
    })
    return nodes
  }

  /**
   * Возвращает массив всех нодов из файла
   * @param filePath
   */
  public static getAnyExportedClassDeclarationNodesFromFile(filePath: string): readonly ts.ClassDeclaration[] {
    const sourceFile = ts.createSourceFile(filePath, fs.readFileSync(filePath).toString(), ts.ScriptTarget.Latest, true)
    const nodes: ts.ClassDeclaration[] = []
    ts.forEachChild(sourceFile, node => {
      if (NodeUtils.isClassDeclaration(node) && NodeUtils.isNodeExported(node)) nodes.push(node)
    })
    return nodes
  }

  public static getClassDecorators(node: ts.ClassDeclaration): readonly ts.Decorator[] {
    return ts.getDecorators(node) ?? []
  }

  public static getClassName(node: ts.ClassDeclaration): string | undefined {
    return node.name?.getText() ?? undefined
  }

  public static isNodeDefaultExported(node: ts.Node): boolean {
    return NodeUtils.isNodeModifierContainsFlag(node, ts.ModifierFlags.ExportDefault)
  }

  public static isNodeExported(node: ts.Node): boolean {
    return NodeUtils.isNodeModifierContainsFlag(node, ts.ModifierFlags.Export)
  }

  public static isNodeModifierContainsFlag(node: ts.Node, modifier: ts.ModifierFlags): boolean {
    return (ts.getCombinedModifierFlags(node as ts.Declaration) & modifier) === modifier
  }
}
