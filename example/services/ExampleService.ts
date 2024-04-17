import { AutoComponent, AutoInject, Inject } from '../../src/v2'
import { ExampleAnotherService } from './ExampleAnotherService'

@AutoComponent
export class ExampleService {
  @AutoInject
  public exampleAnotherService!: ExampleAnotherService

  public getX2value() {
    return this.exampleAnotherService.value * 2
  }
}
