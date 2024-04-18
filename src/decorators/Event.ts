import { MetafoksEventsMap } from '../events'
import { MetafoksApplication } from '../MetafoksApplication'

export function EventHandler<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
  event: Event,
  handler: Handler,
): ClassDecorator {
  MetafoksApplication.shared.events.addEventListener(event, handler)
  return () => {}
}
