import { CoolComponent } from '../../example-extension'
import { Service, Inject } from '../../src'

@Service
export class TestService {
  @Inject
  public coolComponent!: CoolComponent

  public value = 0

  public getValue() {
    return this.value
  }

  public getCoolValue() {
    return this.coolComponent.coolMethod()
  }

  public test() {
    return { ok: 'test-service-ok' }
  }
}
