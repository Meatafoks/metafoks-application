import { MFC } from '../../../src/v2'

@MFC.CreateComponent({ token: 'item', multiple: true })
export class Car {
  public name = 'Car'
}
