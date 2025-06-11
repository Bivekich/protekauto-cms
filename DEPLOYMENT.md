# Руководство по деплою ProtekAuto CMS

## Требования

- Docker и Docker Compose
- Node.js 18+ (для локальной разработки)
- PostgreSQL база данных
- AWS S3 совместимое хранилище
- Билайн SMS API (опционально)

## Переменные окружения

### Обязательные переменные

```bash
# База данных
DATABASE_URL="postgresql://username:password@host:port/database"

# AWS S3 хранилище
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="ru-1"
AWS_S3_BUCKET="your-bucket-name"
S3_ENDPOINT="https://s3.twcstorage.ru"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-32-chars-min"
NEXTAUTH_URL="http://localhost:3000"
```

### SMS API (опционально)

```bash
# Билайн SMS API
BEELINE_SMS_USER="1234567"                 # Логин с сайта a2p-sms.beeline.ru
BEELINE_SMS_PASS="your-password"           # Пароль с сайта a2p-sms.beeline.ru
BEELINE_SMS_SENDER="Protekauto"           # Имя отправителя (опционально)
```

**Примечание:** Если SMS переменные не настроены, система будет работать, но функции отправки SMS будут недоступны.

## Настройка

1. **Скопируйте переменные окружения:**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл с реальными значениями
   ```

2. **Для production деплоя настройте `stack.env`:**
   ```bash
   cp .env.example stack.env
   # Отредактируйте stack.env с production значениями
   ```

## Команды деплоя

### Полный деплой (с пересборкой)
```bash
npm run deploy
# или
bash scripts/deploy.sh
```

### Обновление переменных окружения (без пересборки)
```bash
npm run update:env
# или
bash scripts/update-env.sh
```

### Проверка SMS конфигурации
```bash
npm run check:sms
```

### Локальная разработка
```bash
npm run dev
```

## Мониторинг

### Проверка статуса сервиса
```bash
docker-compose ps
```

### Логи приложения
```bash
docker-compose logs -f
```

### Мониторинг SMS API
```bash
curl http://localhost:3000/api/sms/status
```

## Структура скриптов

- `scripts/deploy.sh` - Полный деплой с проверками
- `scripts/update-env.sh` - Быстрое обновление переменных
- `scripts/check-sms-config.mjs` - Проверка SMS конфигурации
- `scripts/startup.mjs` - Скрипт запуска с проверками

## Устранение проблем

### SMS API не работает

1. Проверьте переменные окружения:
   ```bash
   npm run check:sms
   ```

2. Проверьте статус SMS API:
   ```bash
   curl http://localhost:3000/api/sms/status
   ```

3. Проверьте логи:
   ```bash
   docker-compose logs | grep -i sms
   ```

### Проблемы с базой данных

1. Проверьте подключение к БД:
   ```bash
   npm run test-db
   ```

2. Выполните миграции:
   ```bash
   npx prisma migrate deploy
   ```

### Проблемы с S3

1. Проверьте переменные AWS в логах при старте
2. Убедитесь, что bucket существует и доступен

## Production рекомендации

1. **Безопасность:**
   - Используйте сложные пароли для NEXTAUTH_SECRET
   - Регулярно меняйте AWS ключи
   - Не храните credentials в git

2. **Мониторинг:**
   - Настройте мониторинг health endpoint: `/api/health`
   - Мониторьте SMS API: `/api/sms/status`
   - Настройте алерты на ошибки

3. **Backup:**
   - Регулярно создавайте backup базы данных
   - Настройте backup S3 bucket

4. **Масштабирование:**
   - Используйте reverse proxy (nginx)
   - Настройте load balancer для multiple instances
   - Используйте Redis для session хранения

## FAQ

**Q: Можно ли деплоить без SMS API?**
A: Да, SMS переменные опциональны. Система будет работать без них.

**Q: Как обновить только SMS настройки?**
A: Используйте `npm run update:env` после изменения `stack.env`.

**Q: Как проверить, работает ли SMS API?**
A: Откройте `http://localhost:3000/api/sms/status` в браузере.

**Q: Что делать если деплой упал на проверке SMS?**
A: Либо настройте SMS переменные, либо ответьте 'y' на вопрос о продолжении без SMS. 