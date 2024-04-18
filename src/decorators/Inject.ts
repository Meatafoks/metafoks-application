import { MFC } from './MFC'

/**
 * Инжектит компонент в свойство класса
 */
export const Inject: PropertyDecorator = MFC.InjectComponent({ multiple: false })

/**
 * Инжектит компоненты в свойство класса
 *
 * @param token - токен компонентов
 */
export const InjectMany = (token: string): PropertyDecorator => MFC.InjectComponent({ multiple: true, token })
