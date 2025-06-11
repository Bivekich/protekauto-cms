#!/bin/bash

# Скрипт деплоя ProtekAuto CMS с SMS интеграцией
set -e

echo "🚀 Начало деплоя ProtekAuto CMS..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: запустите скрипт из корневой директории проекта"
    exit 1
fi

# Останавливаем старые контейнеры
echo "🛑 Остановка старых контейнеров..."
docker-compose down --remove-orphans

# Проверяем переменные окружения
echo "🔍 Проверка переменных окружения..."
if [ ! -f "stack.env" ]; then
    echo "❌ Файл stack.env не найден"
    exit 1
fi

# Проверяем SMS конфигурацию
echo "📱 Проверка SMS конфигурации..."
source stack.env
export $(cut -d= -f1 stack.env | grep -v '^#')

# Проверяем обязательные переменные для SMS
if [ -z "$BEELINE_SMS_USER" ] || [ -z "$BEELINE_SMS_PASS" ]; then
    echo "⚠️  SMS переменные не настроены. SMS функции будут недоступны."
    echo "   Для настройки SMS добавьте в stack.env:"
    echo "   BEELINE_SMS_USER=ваш_логин"
    echo "   BEELINE_SMS_PASS=ваш_пароль"
    echo "   BEELINE_SMS_SENDER=Protekauto"
    echo ""
    read -p "Продолжить деплой без SMS? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ SMS API настроен (пользователь: $BEELINE_SMS_USER)"
fi

# Собираем новый образ
echo "🔨 Сборка Docker образа..."
docker-compose build --no-cache

# Запускаем новые контейнеры
echo "🚀 Запуск новых контейнеров..."
docker-compose up -d

# Ждем запуска
echo "⏳ Ожидание запуска сервиса..."
sleep 30

# Проверяем статус
echo "🔍 Проверка статуса сервиса..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Сервис успешно запущен!"
    
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
    echo "🎉 Деплой завершен успешно!"
    echo "🌐 CMS доступна по адресу: http://localhost:3000"
    echo "📊 Мониторинг SMS: http://localhost:3000/api/sms/status"
else
    echo "❌ Ошибка при запуске сервиса"
    echo "Логи:"
    docker-compose logs
    exit 1
fi 