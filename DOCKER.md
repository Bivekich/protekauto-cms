# 🐳 Docker развертывание ProtekaAuto CMS

## Быстрый старт

### 1. Подготовка переменных окружения

Скопируйте пример файла переменных:
```bash
cp .env.docker.example .env.docker
```

Отредактируйте `.env.docker` с вашими реальными значениями.

### 2. Сборка и запуск

```bash
# Сборка образа
docker-compose build

# Запуск с файлом переменных
docker-compose --env-file .env.docker up -d
```

### 3. Проверка работы

```bash
# Просмотр логов
docker-compose logs -f

# Проверка здоровья
curl http://localhost:3000/api/health
```

## Способы передачи переменных окружения

### Вариант 1: Через .env.docker файл (рекомендуется)
```bash
docker-compose --env-file .env.docker up -d
```

### Вариант 2: Через переменные хоста
```bash
export DATABASE_URL="postgresql://..."
export BEELINE_SMS_USER="1234567"
# ... остальные переменные
docker-compose up -d
```

### Вариант 3: Через build args
```bash
docker build \
  --build-arg DATABASE_URL="postgresql://..." \
  --build-arg BEELINE_SMS_USER="1234567" \
  -t protekauto-cms .
```

## Производственное развертывание

### Использование Docker Secrets (рекомендуется для продакшена)

1. Создайте secrets:
```bash
echo "postgresql://..." | docker secret create database_url -
echo "your_sms_user" | docker secret create sms_user -
```

2. Обновите docker-compose.yml для использования secrets:
```yaml
version: '3.8'
services:
  protekauto-cms:
    # ... остальная конфигурация
    secrets:
      - database_url
      - sms_user
    environment:
      - DATABASE_URL_FILE=/run/secrets/database_url
      - BEELINE_SMS_USER_FILE=/run/secrets/sms_user

secrets:
  database_url:
    external: true
  sms_user:
    external: true
```

## Обязательные переменные окружения

### База данных
- `DATABASE_URL` - URL подключения к PostgreSQL

### Аутентификация
- `NEXTAUTH_SECRET` - Секрет для NextAuth (минимум 32 символа)
- `JWT_SECRET` - Секрет для JWT токенов
- `NEXTAUTH_URL` - URL вашего приложения

### S3 хранилище
- `AWS_ACCESS_KEY_ID` - Ключ доступа к S3
- `AWS_SECRET_ACCESS_KEY` - Секретный ключ S3
- `AWS_BUCKET_NAME` - Имя bucket

## Опциональные переменные

### SMS API (Билайн)
- `BEELINE_SMS_USER` - Пользователь SMS API
- `BEELINE_SMS_PASS` - Пароль SMS API
- `BEELINE_SMS_SENDER` - Имя отправителя (по умолчанию: "Protekauto")

### Внешние API
- `LAXIMO_LOGIN`, `LAXIMO_PASSWORD` - Доступ к Laximo
- `AUTOEURO_API_KEY` - Ключ AutoEuro API
- `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` - Настройки YooKassa
- `PARTSAPI_*` - Ключи PartsAPI
- `YANDEX_*` - Ключи Яндекс API

## Мониторинг и логи

### Просмотр логов
```bash
# Все логи
docker-compose logs -f

# Логи конкретного сервиса
docker-compose logs -f protekauto-cms

# Последние 100 строк
docker-compose logs --tail=100 -f
```

### Проверка состояния
```bash
# Статус контейнеров
docker-compose ps

# Использование ресурсов
docker stats

# Проверка здоровья приложения
curl http://localhost:3000/api/health
```

## Обновление

### Обновление образа
```bash
# Остановка сервисов
docker-compose down

# Пересборка с новым кодом
docker-compose build --no-cache

# Запуск обновленной версии
docker-compose --env-file .env.docker up -d
```

### Бэкап и восстановление
```bash
# Бэкап базы данных (если используется локальная PostgreSQL)
docker-compose exec postgres pg_dump -U user database > backup.sql

# Восстановление
docker-compose exec -T postgres psql -U user database < backup.sql
```

## Отладка

### Вход в контейнер
```bash
docker-compose exec protekauto-cms sh
```

### Проверка переменных окружения в контейнере
```bash
docker-compose exec protekauto-cms env | grep -E "(DATABASE|SMS|LAXIMO)"
```

### Проверка сети
```bash
# Проверка доступности портов
docker-compose exec protekauto-cms nc -zv database_host 5432

# Проверка DNS
docker-compose exec protekauto-cms nslookup your-domain.com
```

## Безопасность

### Рекомендации:
1. **Никогда не коммитьте** реальные значения переменных в Git
2. Используйте **Docker Secrets** для продакшена
3. Ограничьте **доступ к .env.docker** файлу (chmod 600)
4. Регулярно **ротируйте секреты**
5. Используйте **HTTPS** в продакшене

### Пример безопасной настройки прав:
```bash
chmod 600 .env.docker
chown root:docker .env.docker
``` 