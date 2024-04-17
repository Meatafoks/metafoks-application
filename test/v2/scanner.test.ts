import { MetafoksScanner } from '../../src/v2'
import 'reflect-metadata'

describe('scanner', () => {
  const path = __dirname + '/testComponents'

  it('should find all components', async () => {
    const scanner = new MetafoksScanner({
      glob: [path + '/**/*.ts'],
      loggerLevel: 'trace',
    })

    const components = await scanner.scanClassComponents()
    expect(components.length).toBe(3)
  })
})
