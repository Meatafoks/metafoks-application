import { abstractApplicationTesting } from '../abstractApplicationTesting'
import { MetafoksApplication } from '../../src'
import { TestService } from '../../example/services/TestService'
import { MetafoksConfigLoader, MetafoksExtensionsLoader } from '../../src/loaders'

describe('config tests', () => {
  abstractApplicationTesting()

  it('should return correct value', () => {
    const testService = MetafoksApplication.getComponent(TestService)
    expect(testService.getCoolValue()).toBe('works')
  })

  it('should changed some overrides', () => {
    const config = MetafoksApplication.getComponent<MetafoksAppConfig>('config')
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
