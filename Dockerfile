# Используем Node.js LTS Alpine для минимального размера
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем зависимости для Puppeteer
RUN apk update && apk add --no-cache \
    # Chromium и зависимости
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    # Дополнительные шрифты для русского языка
    ttf-dejavu \
    ttf-liberation \
    # Системные зависимости
    bash

# Устанавливаем переменные окружения для Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы
COPY . .

# Генерируем Prisma Client
RUN npx prisma generate

# Собираем приложение
RUN npm run build

# Создаем пользователя для безопасности (важно для Puppeteer)
RUN addgroup -S pptruser && adduser -S -G pptruser pptruser \
    && mkdir -p /home/pptruser/Downloads /app \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Переключаемся на непривилегированного пользователя
USER pptruser

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 