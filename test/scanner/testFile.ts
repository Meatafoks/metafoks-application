import 'reflect-metadata'

function MyDecorator(): ClassDecorator {
  return target => {
    Reflect.defineMetadata('my', 'all 0', target)
  }
}
function MyMegoDecorator(): ClassDecorator {
  return target => {
    Reflect.defineMetadata('mego', 'all 1', target)
  }
}

@MyDecorator()
@MyMegoDecorator()
export class TestClass {}

@MyDecorator()
export default class TestDefaultClass {}
