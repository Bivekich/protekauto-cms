FROM node:18.19.0-alpine

WORKDIR /app

# Принимаем аргументы из docker-compose
ARG BEELINE_SMS_USER
ARG BEELINE_SMS_PASS
ARG BEELINE_SMS_SENDER
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG JWT_SECRET

# Копируем package файлы и устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем весь проект
COPY . .

# Создаем .env файл для сборки с переданными аргументами
RUN echo "BEELINE_SMS_USER=${BEELINE_SMS_USER}" > .env && \
    echo "BEELINE_SMS_PASS=${BEELINE_SMS_PASS}" >> .env && \
    echo "BEELINE_SMS_SENDER=${BEELINE_SMS_SENDER:-Protekauto}" >> .env && \
    echo "DATABASE_URL=${DATABASE_URL}" >> .env && \
    echo "NEXTAUTH_SECRET=${NEXTAUTH_SECRET}" >> .env && \
    echo "JWT_SECRET=${JWT_SECRET}" >> .env

# Генерируем Prisma Client
RUN npm run prisma:generate

# Собираем приложение
RUN npm run build

# Удаляем .env файл после сборки (переменные будут переданы через environment в docker-compose)
RUN rm -f .env

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 