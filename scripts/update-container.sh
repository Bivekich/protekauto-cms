#!/bin/bash

echo "🚀 Обновление контейнера CMS с новыми переменными PartsAPI..."

# Остановка контейнера
echo "⏹️  Остановка контейнера..."
docker-compose down

# Пересборка с новыми переменными
echo "🔨 Пересборка образа..."
docker-compose build --no-cache

# Запуск с обновленными переменными
echo "▶️  Запуск обновленного контейнера..."
docker-compose up -d

# Проверка статуса
echo "📊 Проверка статуса контейнера..."
docker-compose ps

echo "✅ Обновление завершено!"
echo "📝 Проверьте логи командой: docker-compose logs -f" 