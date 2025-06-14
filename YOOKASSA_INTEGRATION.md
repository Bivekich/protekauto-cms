# Интеграция YooKassa

Данная интеграция позволяет принимать платежи через YooKassa API в системе ProtekaAuto.

## Настройка

### 1. Переменные окружения

Добавьте в файл `.env` следующие переменные:

```env
# YooKassa API для обработки платежей
YOOKASSA_SHOP_ID="1100078"
YOOKASSA_SECRET_KEY="test_5pt99RUB8Wj4rB6y63OKbG2vdBEMm0sJnsmDSQwhiXQ"
```

### 2. Webhook URL

Настройте в личном кабинете YooKassa webhook URL:
```
https://your-domain.com/api/payments/webhook
```

## Структура базы данных

Интеграция добавляет следующие таблицы:

### Order (Заказы)
- `id` - уникальный идентификатор
- `orderNumber` - номер заказа
- `clientId` - ID клиента (опционально)
- `clientEmail`, `clientPhone`, `clientName` - данные для гостевых заказов
- `status` - статус заказа (PENDING, PAID, PROCESSING, SHIPPED, DELIVERED, CANCELED, REFUNDED)
- `totalAmount` - общая сумма
- `discountAmount` - размер скидки
- `finalAmount` - итоговая сумма к оплате
- `currency` - валюта (по умолчанию RUB)
- `deliveryAddress` - адрес доставки
- `comment` - комментарий к заказу

### OrderItem (Товары в заказе)
- `id` - уникальный идентификатор
- `orderId` - ID заказа
- `productId` - ID товара из каталога (опционально)
- `externalId` - ID внешнего товара (например, из AutoEuro)
- `name` - название товара
- `article` - артикул
- `brand` - бренд
- `price` - цена за единицу
- `quantity` - количество
- `totalPrice` - общая стоимость (price * quantity)

### Payment (Платежи)
- `id` - уникальный идентификатор
- `orderId` - ID заказа
- `yookassaPaymentId` - ID платежа в YooKassa
- `status` - статус платежа (PENDING, WAITING_FOR_CAPTURE, SUCCEEDED, CANCELED, REFUNDED)
- `amount` - сумма платежа
- `currency` - валюта
- `paymentMethod` - способ оплаты
- `description` - описание платежа
- `confirmationUrl` - URL для подтверждения платежа
- `paidAt` - дата успешной оплаты
- `canceledAt` - дата отмены

## GraphQL API

### Мутации

#### Создание заказа
```graphql
mutation CreateOrder($input: CreateOrderInput!) {
  createOrder(input: $input) {
    id
    orderNumber
    status
    totalAmount
    finalAmount
    items {
      id
      name
      price
      quantity
    }
  }
}
```

#### Создание платежа
```graphql
mutation CreatePayment($input: CreatePaymentInput!) {
  createPayment(input: $input) {
    payment {
      id
      yookassaPaymentId
      status
      amount
      confirmationUrl
    }
    confirmationUrl
  }
}
```

### Запросы

#### Получение заказов
```graphql
query GetOrders($clientId: String, $status: OrderStatus, $limit: Int, $offset: Int) {
  orders(clientId: $clientId, status: $status, limit: $limit, offset: $offset) {
    id
    orderNumber
    status
    totalAmount
    finalAmount
    createdAt
  }
}
```

#### Получение платежей
```graphql
query GetPayments($orderId: String, $status: PaymentStatus) {
  payments(orderId: $orderId, status: $status) {
    id
    yookassaPaymentId
    status
    amount
    createdAt
  }
}
```

## Процесс оплаты

1. **Создание заказа** - клиент создает заказ с товарами
2. **Создание платежа** - система создает платеж в YooKassa и получает URL для оплаты
3. **Перенаправление** - клиент перенаправляется на страницу оплаты YooKassa
4. **Оплата** - клиент вводит данные карты и подтверждает платеж
5. **Webhook** - YooKassa отправляет уведомление о статусе платежа
6. **Обновление статуса** - система обновляет статус заказа и платежа

## Тестирование

### Тестовая страница
Доступна по адресу: `/dashboard/payments/test`

### Тестовые карты YooKassa
- **Успешная оплата**: 5555 5555 5555 4444
- **Отклоненная оплата**: 5555 5555 5555 4477
- **Любой CVC**: 123
- **Любая дата**: 12/30

### Webhook тестирование
Для тестирования webhook'ов локально используйте ngrok:
```bash
ngrok http 3000
```

Затем укажите в настройках YooKassa URL:
```
https://your-ngrok-url.ngrok.io/api/payments/webhook
```

## Безопасность

1. **Проверка подписи** - все webhook'и проверяются на подлинность
2. **HTTPS** - обязательно использование HTTPS в продакшене
3. **Секретные ключи** - храните секретные ключи в переменных окружения
4. **Валидация** - все входящие данные валидируются

## Логирование

Система логирует:
- Создание заказов и платежей
- Получение webhook'ов
- Ошибки интеграции
- Изменения статусов

Логи доступны в консоли сервера и могут быть настроены для отправки в внешние системы мониторинга.

## Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в правильности настройки webhook'ов
3. Проверьте переменные окружения
4. Обратитесь к документации YooKassa: https://yookassa.ru/developers/

## Статусы заказов

- `PENDING` - ожидает оплаты
- `PAID` - оплачен
- `PROCESSING` - в обработке
- `SHIPPED` - отправлен
- `DELIVERED` - доставлен
- `CANCELED` - отменен
- `REFUNDED` - возвращен

## Статусы платежей

- `PENDING` - ожидает оплаты
- `WAITING_FOR_CAPTURE` - ожидает подтверждения
- `SUCCEEDED` - успешно оплачен
- `CANCELED` - отменен
- `REFUNDED` - возвращен 