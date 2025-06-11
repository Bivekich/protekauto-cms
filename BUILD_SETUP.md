# Настройка процесса сборки ProtekAuto CMS

## Обзор изменений

Процесс сборки был обновлен для поддержки новых переменных окружения SMS API Билайн.

## Новые переменные окружения

### Docker Compose
Добавлены переменные в `docker-compose.yml`:
```yaml
# SMS API Билайн
- BEELINE_SMS_USER=${BEELINE_SMS_USER}
- BEELINE_SMS_PASS=${BEELINE_SMS_PASS}
- BEELINE_SMS_SENDER=${BEELINE_SMS_SENDER}
```

### Файлы конфигурации
- `.env.example` - Шаблон переменных для разработчиков
- `stack.env` - Production переменные
- `.env` - Локальные переменные для разработки

## Новые npm скрипты

```json
{
  "check:sms": "node scripts/check-sms-config.mjs",
  "prebuild": "npm run check:sms",
  "deploy": "bash scripts/deploy.sh",
  "update:env": "bash scripts/update-env.sh"
}
```

## Скрипты сборки и деплоя

### 1. `scripts/check-sms-config.mjs`
- ✅ Проверка SMS переменных перед сборкой
- ✅ Валидация формата логина (числовой)
- ✅ Проверка длины пароля (минимум 6 символов)

### 2. `scripts/deploy.sh`
- 🚀 Полный деплой с пересборкой Docker образа
- 🔍 Проверка переменных окружения
- 📱 Валидация SMS конфигурации
- ⚡ Автоматический healthcheck

### 3. `scripts/update-env.sh`
- 🔄 Быстрое обновление без пересборки
- 📱 Проверка SMS API после обновления
- ⏱️ Минимальное время простоя

### 4. `scripts/startup.mjs`
- ✅ Проверка обязательных переменных при старте
- ⚠️ Предупреждения об отсутствующих SMS переменных
- 🔄 Интеграция с Docker startup

## Workflow сборки

### Pre-build процесс
1. `npm run prebuild` → `npm run check:sms`
2. Проверка SMS конфигурации
3. Выход с ошибкой если критические проблемы

### Build процесс
1. `prisma generate` - генерация Prisma клиента
2. `next build` - сборка Next.js приложения
3. ✅ Все warnings исправлены

### Deployment процесс
1. Остановка старых контейнеров
2. Проверка stack.env
3. Валидация SMS переменных
4. Сборка нового образа
5. Запуск контейнеров
6. Healthcheck

## Мониторинг

### SMS API статус
```bash
curl http://localhost:3000/api/sms/status
```

### Docker контейнеры
```bash
docker-compose ps
docker-compose logs -f
```

### Команды для разработчиков

#### Первичная настройка
```bash
cp .env.example .env
# Отредактируйте .env с реальными значениями
npm install
npm run dev
```

#### Проверка конфигурации
```bash
npm run check:sms
```

#### Локальная сборка
```bash
npm run build
```

#### Production деплой
```bash
npm run deploy
```

#### Обновление только конфигурации
```bash
npm run update:env
```

## Особенности

### Опциональные SMS переменные
- ✅ Система работает без SMS API
- ⚠️ При отсутствии SMS переменных - предупреждение
- 🔄 Graceful fallback в development режиме

### Безопасность
- 🔒 Пароли не отображаются в логах
- 🔍 Валидация переменных перед стартом
- 📝 Детальные логи только в development

### Автоматизация
- 🔄 Автоматическая проверка перед сборкой
- 📊 Встроенный мониторинг
- 🚀 One-click deployment

## Troubleshooting

### Проблема: SMS переменные не найдены
```bash
npm run check:sms
# Проверьте .env или stack.env файлы
```

### Проблема: Docker не собирается
```bash
# Очистка Docker кеша
docker system prune -a
npm run deploy
```

### Проблема: Переменные не передаются в контейнер
```bash
# Проверьте docker-compose.yml
# Убедитесь, что переменные есть в stack.env
```

## CI/CD готовность

Процесс сборки готов для интеграции с CI/CD:
- ✅ Автоматические проверки
- ✅ Graceful error handling  
- ✅ Детальные логи
- ✅ Zero-downtime updates
- ✅ Health checks

Для GitHub Actions, GitLab CI или других CI/CD систем используйте:
```bash
npm run check:sms && npm run build
``` 