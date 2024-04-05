import { abstractApplicationTesting } from '../abstractApplicationTesting'
import { MetafoksApplication } from '../../src'
import { TestService } from '../../example/services/TestService'

describe('config tests with profile', () => {
  abstractApplicationTesting({ config: { profile: 'test1' } })

  it('should return correct value', () => {
    const testService = MetafoksApplication.getComponent(TestService)
    expect(testService.getCoolValue()).toBe('works in test 1')
  })
})
