import { MFC } from '../../../src'

@MFC.CreateComponent({ token: 'item', multiple: true })
export class Fish {
  public name = 'Fish'
}
