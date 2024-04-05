import { Application, Autowire, Override, With } from '../src'
import { TestService } from './services/TestService'
import { ExampleExtension } from '../example-extension'

@With(ExampleExtension)
@Override({ foo: 'poo' })
@Application
export class App {
  @Autowire
  public service!: TestService

  public start() {
    this.service.value = 10
  }
}
