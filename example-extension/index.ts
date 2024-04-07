import { MetafoksExtension } from '../src'
import { CoolComponent } from './CoolComponent'
import { ExtensionFactory } from '../src/extionsion/ExtensionFactory'

export { CoolComponent }

export const ExampleExtension = ExtensionFactory.create<{ key?: string }>({
  identifier: 'com.extension.test.id',
  configProperty: 'testEx',
  install: (container, config) => {
    container.set(CoolComponent, new CoolComponent(config.key ?? ''))
  },
  autorun: () => {
    console.log('autorun!')
  },
})
