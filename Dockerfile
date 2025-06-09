FROM node:18.19.0-alpine

WORKDIR /app

# Копируем package файлы и устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Копируем весь проект
COPY . .

# Генерируем Prisma Client
RUN npm run prisma:generate

# Собираем приложение
RUN npm run build

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"] 