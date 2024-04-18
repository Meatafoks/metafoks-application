import { abstractApplicationTesting } from '../abstractApplicationTesting'
import { MetafoksApplication } from '../../src'
import { TestService } from '../../example/services/TestService'
import { MetafoksConfigLoader, MetafoksExtensionsLoader } from '../../src'

describe('config tests', () => {
  abstractApplicationTesting()

  it('should return correct value', () => {
    const testService = MetafoksApplication.shared.container.getClassFirst(TestService)
    expect(testService.getCoolValue()).toBe('works')
  })

  it('should changed some overrides', () => {
    const config = MetafoksApplication.shared.container.getFirst<MetafoksAppConfig>('config')
    expect(config.foo).not.toBe('bar')
    expect(config.foo).toBe('poo')
  })

  it('should throw cuz its freeze', () => {
    expect(() => {
      // @ts-ignore
      MetafoksApplication.configuration.test = 1
    }).toThrow()

    expect(() => {
      // @ts-ignore
      MetafoksExtensionsLoader.configuration.some = false
    }).toThrow()

    expect(() => {
      // @ts-ignore
      MetafoksConfigLoader.configuration.autorun = false
    }).toThrow()
  })
})
