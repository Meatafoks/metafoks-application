import { MetafoksExtension } from '../src'
import { CoolComponent } from './CoolComponent'

export { CoolComponent }

export const ExampleExtension: MetafoksExtension<{ testEx: { key: string } }> = {
  identifier: 'com.extension.test.id',
  install: (container, config) => {
    container.set(CoolComponent, new CoolComponent(config?.testEx?.key))
  },
  autorun: () => {
    console.log('autorun!')
  },
}
