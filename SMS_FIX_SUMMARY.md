# Исправления SMS интеграции с Beeline API

## Проблема
В логах было видно: "Ошибка отправки SMS: Неизвестная ошибка от SMS API", хотя SMS фактически доставлялась.

## Причина
Функция `parseResponse` в `src/lib/sms-service.ts` неправильно парсила XML ответ от Beeline API.

## Исправления

### 1. Исправлен парсинг XML ответа

**Было:**
```typescript
if (responseText.includes('<status>successfully</status>')) {
  // Поиск несуществующего тега
}
```

**Стало:**
```typescript
if (responseText.includes('<result') && responseText.includes('<sms')) {
  // Правильный поиск успешного ответа
  const smsIdMatch = responseText.match(/id="(\d+)"/)
  return {
    success: true,
    messageId: smsIdMatch ? smsIdMatch[1] : undefined,
    raw: responseText
  }
}
```

### 2. Улучшена обработка ошибок
- Добавлены правильные регулярные выражения для поиска ошибок в XML
- Добавлена обработка случая, когда XML валидный, но без явных ошибок

### 3. Исправлена функция getBalance
- Обновлена для правильного парсинга ответа баланса от Beeline API

### 4. Улучшено логирование
- SMS сервис теперь сам логирует результаты отправки
- Убрано дублированное логирование в resolver'е
- В development режиме код всё ещё показывается в консоли при ошибках

## Формат ответа Beeline API

### Успешная отправка:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<output>
  <RECEIVER AGT_ID="891602" DATE_REPORT="11.06.2025 14:43:29"/>
  <result sms_group_id="1175441873572364732">
    <sms post_id="auth_1749642209427_mwmaxr" id="1175440774060736956" smstype="SENDSMS" phone="+79611177205" sms_res_count="1">
      <![CDATA[Код подтверждения для Protek Auto: 38782. Никому не сообщайте этот код.]]>
    </sms>
  </result>
</output>
```

### Ошибка:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<output>
  <error>Описание ошибки</error>
</output>
```

## Результат
- SMS корректно определяются как успешно отправленные
- Убраны ложные ошибки в логах
- Сохранена функциональность показа кода в development режиме
- Улучшена читаемость и отладка кода 