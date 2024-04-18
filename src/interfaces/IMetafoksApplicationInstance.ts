import { MetafoksEvents } from '../events'
import { MetafoksContainer } from '../context'

export interface IMetafoksApplicationInstance {
  events: MetafoksEvents
  container: MetafoksContainer
}
