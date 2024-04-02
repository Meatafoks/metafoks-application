import { Application, Autowire, With } from '../src'
import { ExampleExtension } from '../example-extension'
import { TestService } from '../example/services/TestService'

describe('base test', () => {
  it('should start application', () => {
    @With(ExampleExtension)
    @Application
    class App {
      @Autowire
      public service!: TestService

      public start() {
        this.service.value = 10
        console.log(this.service.value)
      }
    }
  })
})
