import { ExampleAnotherService } from './ExampleAnotherService'
import { Inject, Service } from '../../src'

@Service
export class ExampleService {
  @Inject
  public exampleAnotherService!: ExampleAnotherService

  public getX2value() {
    return this.exampleAnotherService.value * 2
  }
}
