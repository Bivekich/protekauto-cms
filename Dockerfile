FROM node:18.19.0-alpine

WORKDIR /app

# Принимаем аргументы из docker-compose
ARG BEELINE_SMS_USER
ARG BEELINE_SMS_PASS
ARG BEELINE_SMS_SENDER
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG JWT_SECRET
ARG AWS_REGION
ARG AWS_ACCESS_KEY_ID
ARG AWS_SECRET_ACCESS_KEY
ARG AWS_BUCKET_NAME
ARG AWS_S3_BUCKET
ARG S3_ENDPOINT
ARG NEXTAUTH_URL
ARG LAXIMO_LOGIN
ARG LAXIMO_PASSWORD
ARG LAXIMO_DOC_LOGIN
ARG LAXIMO_DOC_PASSWORD
ARG YOOKASSA_SHOP_ID
ARG YOOKASSA_SECRET_KEY
ARG AUTOEURO_API_KEY

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
    echo "JWT_SECRET=${JWT_SECRET}" >> .env && \
    echo "AWS_REGION=${AWS_REGION}" >> .env && \
    echo "AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}" >> .env && \
    echo "AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}" >> .env && \
    echo "AWS_BUCKET_NAME=${AWS_BUCKET_NAME}" >> .env && \
    echo "AWS_S3_BUCKET=${AWS_S3_BUCKET}" >> .env && \
    echo "S3_ENDPOINT=${S3_ENDPOINT}" >> .env && \
    echo "NEXTAUTH_URL=${NEXTAUTH_URL}" >> .env && \
    echo "LAXIMO_LOGIN=${LAXIMO_LOGIN}" >> .env && \
    echo "LAXIMO_PASSWORD=${LAXIMO_PASSWORD}" >> .env && \
    echo "LAXIMO_DOC_LOGIN=${LAXIMO_DOC_LOGIN}" >> .env && \
    echo "LAXIMO_DOC_PASSWORD=${LAXIMO_DOC_PASSWORD}" >> .env && \
    echo "YOOKASSA_SHOP_ID=${YOOKASSA_SHOP_ID}" >> .env && \
    echo "YOOKASSA_SECRET_KEY=${YOOKASSA_SECRET_KEY}" >> .env && \
    echo "AUTOEURO_API_KEY=${AUTOEURO_API_KEY}" >> .env

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