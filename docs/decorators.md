# Декораторы приложения
1. DI Декораторы
   1. @Component
   2. @Autowire
   3. @Config
2. Декораторы конфигурации

## DI Декораторы
DI Декораторы или Dependency Injection декораторы необходимы для управления контекстом приложения.

### @Component
Декоратор `@Component` регистрирует класс в системе контекста Metafoks.
```typescript
import { Component } from "metafoks-application";

// Регистрирует компонент Foo
@Component
class Foo {
}
```
После его регистрации, компонент становится доступен в контексте приложения и может быть получен
с помощью декоратора `@Autowire`.

### @Autowire
Декоратор `@Autowire` выполняет загрузку компонента из контекста.

```typescript
import { Component, Autowire } from "metafoks-application";
import { For } from "@babel/types";

// Регистрирует компонент Foo
@Component
class Foo {

  public getValue() {
    return true
  }

}

// Регистрирует компонент Bar
@Component
class Bar {

  // Подключает компонент Foo 
  // (извлекает его из контекста MetafoksApplication и внедряет в переменную)
  @Autowire
  public fooComponent!: Foo
  
  public testValue(){
    return this.fooComponent === true // true
  }

}
```

### @Config
Подключает файл конфигурации в переменную, см: [Получение конфигурации в приложении](config.md#получение-конфигурации-в-приложении)

## Декораторы конфигурации

