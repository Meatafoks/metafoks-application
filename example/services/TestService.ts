import { Autowire, Service } from '@metafoks/context'
import { CoolComponent } from '../../example-extension'

@Service
export class TestService {
  @Autowire
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
