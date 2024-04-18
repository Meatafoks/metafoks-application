import { CoolComponent } from './CoolComponent'
import { ExtensionFactory } from '../src'

export { CoolComponent }

export const ExampleExtension = ExtensionFactory.create<{ key?: string }>({
  identifier: 'com.extension.test.id',
  configProperty: 'testEx',
  install: (app, config) => {
    app.container.set(CoolComponent.name, new CoolComponent(config.key ?? ''))
  },
  autorun: () => {
    console.log('autorun!')
  },
})
