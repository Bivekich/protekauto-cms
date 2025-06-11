#!/bin/bash

# Скрипт для обновления переменных окружения без пересборки образа
set -e

echo "🔄 Обновление переменных окружения..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: запустите скрипт из корневой директории проекта"
    exit 1
fi

# Проверяем файл stack.env
if [ ! -f "stack.env" ]; then
    echo "❌ Файл stack.env не найден"
    exit 1
fi

# Загружаем новые переменные
echo "📂 Загрузка переменных из stack.env..."
source stack.env
export $(cut -d= -f1 stack.env | grep -v '^#')

# Проверяем SMS конфигурацию
echo "📱 Проверка SMS конфигурации..."
if [ -z "$BEELINE_SMS_USER" ] || [ -z "$BEELINE_SMS_PASS" ]; then
    echo "⚠️  SMS переменные не настроены"
else
    echo "✅ SMS API настроен (пользователь: $BEELINE_SMS_USER)"
    echo "   Отправитель: ${BEELINE_SMS_SENDER:-Protekauto}"
fi

# Перезапускаем контейнеры с новыми переменными
echo "🔄 Перезапуск контейнеров с новой конфигурацией..."
docker-compose down
docker-compose up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервиса..."
sleep 15

# Проверяем статус
echo "🔍 Проверка статуса..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Сервис успешно перезапущен!"
    
    # Проверяем SMS API если настроен
    if [ ! -z "$BEELINE_SMS_USER" ] && [ ! -z "$BEELINE_SMS_PASS" ]; then
        echo "📱 Проверка SMS API..."
        sleep 5
        if curl -s -f "http://localhost:3000/api/sms/status" > /dev/null; then
            echo "✅ SMS API работает"
        else
            echo "⚠️  SMS API может быть недоступен"
        fi
    fi
    
    echo ""
    echo "🎉 Обновление завершено!"
    echo "🌐 CMS: http://localhost:3000"
    echo "📊 SMS статус: http://localhost:3000/api/sms/status"
else
    echo "❌ Ошибка при перезапуске"
    docker-compose logs --tail=50
    exit 1
fi 