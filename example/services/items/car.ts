import { MFC } from '../../../src'

@MFC.CreateComponent({ token: 'item', multiple: true })
export class Car {
  public name = 'Car'
}
