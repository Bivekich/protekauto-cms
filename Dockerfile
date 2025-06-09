FROM node:18.19.0-alpine AS base

# Устанавливаем зависимости только при необходимости
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Устанавливаем зависимости
COPY package.json package-lock.json* ./
RUN npm install

# Собираем приложение
FROM base AS builder
WORKDIR /app

# Устанавливаем все зависимости (включая devDependencies)
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Копируем переменные окружения для сборки (будут заменены в runtime)
ENV NEXT_TELEMETRY_DISABLED 1

# Генерируем Prisma Client и собираем приложение
RUN npm run prisma:generate
RUN npm run build

# Производственный образ, копируем только необходимые файлы
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Копируем сгенерированные файлы с правильными разрешениями
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/src/generated ./src/generated

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 