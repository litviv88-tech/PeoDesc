## Что есть в системе (сущности):

Note - Совет (объединено с бывшим Sovet): title, content, visibility, категория, голоса
User — владелец советов, автор, голосующий
Tag — метки (многие-ко-многим с Note)
Vote — голос пользователя за публичный совет (уникально: один пользователь → один голос на совет)
(опционально) Collection / Folder — папки/коллекции для организации
(опционально) Sovet Version — версии промта (история изменений)

## Ключевые правила:

- Публичность — это свойство Note (visibility)
- Голосовать можно только по публичным (проверяется на уровне приложения; можно усилить триггером/констрейнтом позже)
- Голос уникален: (userId, noteId) — уникальный индекс

## Схема базы данных
- User: id (cuid), email unique, name optional, createdAt
- Category: id, category
- Note: id, ownerId -> User, title, content, description optional, categoryId -> Category,
  visibility (PRIVATE|PUBLIC, default PRIVATE), createdAt, updatedAt, publishedAt nullable
- Vote: id, userId -> User, noteId -> Note, value int default 1, createdAt
- Ограничение: один пользователь может проголосовать за промт только один раз:
  UNIQUE(userId, noteId)
- Индексы:
  Note (ownerId, updatedAt)
  Note (visibility, createdAt)
  Vote(noteId)
  Vote(userId)
- onDelete: Cascade для связей
