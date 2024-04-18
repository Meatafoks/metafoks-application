import { ComponentConstructor } from '../types'

export type MetafoksContainerEntity = ComponentConstructor | object
export type MetafoksContainerComponent = InstanceType<ComponentConstructor> | object
