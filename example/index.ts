import { Application, Autowire, Configure, Override, With } from '../src'
import { TestService } from './services/TestService'
import { ExampleExtension } from '../example-extension'
import { Inject, InjectManyByToken } from '../src/v2'
import { ExampleService } from './services/ExampleService'

@With(ExampleExtension)
@Override({ foo: 'poo' })
@Configure({
  scanner: {
    glob: ['./example/**/*.ts'],
    loggerLevel: 'debug',
  },
  logger: {
    defaultLevel: 'debug',
    level: {
      MetafoksContainer: 'trace',
    },
  },
})
@Application
export class App {
  @Autowire
  public service!: TestService

  @Inject
  public exampleService!: ExampleService

  @InjectManyByToken('item')
  public items!: any[]

  public start() {
    console.log('App started')
    console.log(this.exampleService.getX2value())

    for (const item of this.items) {
      console.log(item.name)
    }

    this.service.value = 10
  }
}
