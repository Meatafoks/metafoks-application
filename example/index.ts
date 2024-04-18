import { Application, Configure, Override, With } from '../src'
import { TestService } from './services/TestService'
import { ExampleExtension } from '../example-extension'
import { Inject, InjectMany } from '../src'
import { ExampleService } from './services/ExampleService'

@With(ExampleExtension)
@Override({ foo: 'poo' })
@Configure({
  scanner: {
    glob: ['./example/**/*.ts'],
  },
  logger: {
    defaultLevel: 'info',
    level: {
      MetafoksContainer: 'info',
    },
  },
})
@Application
export class App {
  @Inject
  public service!: TestService

  @Inject
  public exampleService!: ExampleService

  @InjectMany('item')
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
