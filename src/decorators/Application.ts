import { MetafoksApplication } from '../MetafoksApplication'
import { RawService } from '@metafoks/context'
import { MetafoksApplicationComponentIdentifier } from '../identify'

/**
 * @param target
 * @constructor
 */
export function Application(target: any) {
  RawService(MetafoksApplicationComponentIdentifier)(target)
  if (MetafoksApplication.ignoreDecoratorAutorun) return

  MetafoksApplication.startApplication().catch(reason => {
    console.error(reason)
  })
}
