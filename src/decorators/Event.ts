import { MetafoksEvents, MetafoksEventsMap } from '../events'

export function EventHandler<Event extends keyof MetafoksEventsMap, Handler extends MetafoksEventsMap[Event]>(
  event: Event,
  handler: Handler,
): ClassDecorator {
  MetafoksEvents.addEventListener(event, handler)
  return () => {}
}
