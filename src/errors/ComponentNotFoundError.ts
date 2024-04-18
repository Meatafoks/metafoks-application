import { MetafoksContainerToken } from '../context'

export class ComponentNotFoundError extends Error {
  constructor(container: string, token: MetafoksContainerToken) {
    super(`Component <${String(token)}> not found in container <${container}>`)
  }
}
