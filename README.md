# PeoDesc

Сообщество, где родители делятся практическими советами по уходу за детьми.

Стек: **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma**, **Neon PostgreSQL**. Готово к деплою на **Vercel**.

## Быстрый старт (PowerShell)

```powershell
cd E:\work\ProDecs
Copy-Item .env.example .env
# Вставьте реальный DATABASE_URL из Neon в .env
npm install
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

Откройте http://localhost:3000 — главная страница читает таблицу `Note` из PostgreSQL.

## Neon: `DATABASE_URL`

1. Создайте проект на [Neon](https://neon.tech).
2. Dashboard → **Connection details** → скопируйте PostgreSQL URL.
3. Для миграций удобнее **Direct**, для runtime на Vercel часто берут **Pooled**.
4. В URL должен быть `?sslmode=require`.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

Шаблон: `.env.example`. Файл `.env` в git не коммитится.

## Команды БД

| Команда | Назначение |
|---|---|
| `npm run db:generate` | Сгенерировать Prisma Client |
| `npm run db:migrate` | Dev-миграция (интерактивно) |
| `npm run db:migrate:deploy` | Применить уже существующие миграции (CI / Vercel / Neon) |
| `npm run db:push` | Применить схему без файлов миграций |
| `npm run db:seed` | Заполнить 3 тестовые заметки |

Начальная миграция уже в репозитории: `prisma/migrations/20260720120000_init`.

## Модель `Note`

```prisma
model Note {
  id        String   @id @default(uuid()) @db.Uuid
  title     String
  createdAt DateTime @default(now())
}
```

Главная (`src/app/page.tsx`) — Server Component с `force-dynamic`: запрос к БД только при открытии страницы, сборка на Vercel не требует живой БД.

## Деплой на Vercel

1. Импортируйте репозиторий [litviv88-tech/PeoDesc](https://github.com/litviv88-tech/PeoDesc) в [Vercel](https://vercel.com).
2. **Environment Variables** → добавьте `DATABASE_URL` (Neon).
3. Сборка уже настроена: `"build": "prisma generate && next build"` + `postinstall`.
4. Перед первым деплоем примените миграции к production-базе:

```powershell
$env:DATABASE_URL = "postgresql://..."  # production URL из Neon
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

Опционально Build Command на Vercel:

```text
npx prisma migrate deploy && npm run build
```

## Структура

```text
prisma/
  schema.prisma
  seed.ts
  migrations/20260720120000_init/
src/
  app/page.tsx      # читает Note из БД
  lib/prisma.ts     # singleton Prisma Client
```
