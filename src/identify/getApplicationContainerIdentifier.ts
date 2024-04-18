/**
 * Формирует идентификатор контейнера приложения
 * @param name Название приложения
 */
export function getApplicationContainerIdentifier(name: string) {
  return 'MAI:' + name
}
