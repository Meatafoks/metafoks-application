import { MetafoksApplicationConfigurationExtra, startMetafoksTesting } from '../src'
import { App } from '../example'
import { merge } from '@metafoks/toolbox'

/**
 * Функция настройки абстрактного тестирования приложения Metafoks Application
 */
export function abstractApplicationTesting(config: MetafoksApplicationConfigurationExtra = {}) {
  beforeAll(async () => {
    await startMetafoksTesting(
      App,
      merge(
        {
          config: {
            configPath: 'test/config',
          },
          extensions: {
            autorun: {
              exclude: ['com.extension.test.id'],
            },
          },
        },
        config,
      ),
    )
  })

  afterAll(async () => {
    //>>
  })
}
