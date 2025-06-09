'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Client {
  id: string
  name: string
}

interface OrderHistoryProps {
  client: Client
}

export const OrderHistory = ({ client }: OrderHistoryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>История заказов</CardTitle>
      </CardHeader>
      <CardContent>
        <p>История заказов клиента {client.name}</p>
        <p className="text-muted-foreground mt-4">
          Функционал истории заказов будет добавлен позже
        </p>
      </CardContent>
    </Card>
  )
} 