# ProtekAuto CMS

Админ панель для управления контентом веб-приложения, построенная на Next.js, GraphQL и Prisma.

## Возможности

- ✅ Автоматическая инициализация системы
- ✅ Создание первого администратора
- ✅ GraphQL API
- ✅ Современный UI с Shadcn/ui
- ✅ Работа с базой данных через Prisma ORM
- 🔄 Интеграция с S3 для файлов (в разработке)

## Технологии

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Shadcn/ui, Radix UI
- **Backend**: GraphQL (Apollo Server)
- **Database**: PostgreSQL + Prisma ORM
- **Forms**: React Hook Form + Zod validation
- **Storage**: AWS S3 (планируется)

## Установка и настройка

### 1. Клонирование и установка зависимостей

```bash
git clone <repository-url>
cd protekauto-cms
npm install
```

### 2. Настройка базы данных

Обновите файл `.env` с данными вашей облачной базы данных:

```env
# Database
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# AWS S3 (для будущего использования)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""

# NextAuth (для будущего использования)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Применение миграций базы данных

```bash
# Создание и применение миграции
npx prisma db push

# Генерация Prisma клиента
npx prisma generate
```

### 4. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## Первый запуск

При первом запуске система автоматически:

1. Проверит наличие пользователей в базе данных
2. Если пользователей нет, перенаправит на страницу `/setup`
3. На странице настройки можно создать первого администратора
4. После создания пользователя произойдет перенаправление на главную страницу

## Структура проекта

```
src/
├── app/                    # Next.js App Router
│   ├── api/graphql/       # GraphQL API endpoint
│   ├── setup/             # Страница инициализации
│   └── layout.tsx         # Главный layout
├── components/
│   ├── providers/         # React провайдеры
│   ├── setup/            # Компоненты настройки
│   └── ui/               # Shadcn UI компоненты
├── lib/
│   ├── graphql/          # GraphQL схемы и resolvers
│   ├── apollo-client.ts  # Apollo Client конфигурация
│   ├── prisma.ts         # Prisma клиент
│   └── utils.ts          # Утилиты
└── generated/
    └── prisma/           # Сгенерированный Prisma клиент
```

## GraphQL API

API доступно по адресу `/api/graphql` и поддерживает:

### Queries
- `hasUsers` - проверка наличия пользователей
- `users` - получение списка пользователей
- `user(id)` - получение пользователя по ID

### Mutations
- `createUser(input)` - создание нового пользователя

## Разработка

### Добавление новых UI компонентов

```bash
npx shadcn@latest add [component-name]
```

### Работа с базой данных

```bash
# Просмотр данных в Prisma Studio
npx prisma studio

# Сброс базы данных
npx prisma db push --force-reset

# Создание миграции
npx prisma migrate dev --name [migration-name]
```

### GraphQL

Для тестирования GraphQL запросов откройте `/api/graphql` в браузере.

## Тестирование

### Тест S3 хранилища
Откройте [http://localhost:3000/test-s3](http://localhost:3000/test-s3) для тестирования загрузки файлов в S3.

### Тест GraphQL API
Откройте [http://localhost:3000/api/graphql](http://localhost:3000/api/graphql) для проверки GraphQL API.

## Следующие шаги

- [ ] Добавить аутентификацию и авторизацию
- [x] Интегрировать S3 для загрузки файлов
- [ ] Добавить управление контентом
- [ ] Создать систему ролей и разрешений
- [ ] Добавить логирование и мониторинг
# protekauto-cms
