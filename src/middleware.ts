import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Получаем origin из заголовков
  const origin = request.headers.get('origin')
  
  // Проверяем, является ли запрос OPTIONS (preflight)
  const isPreflightRequest = request.method === 'OPTIONS'

  // Создаем базовый объект response
  const response = isPreflightRequest 
    ? new NextResponse(null, { status: 204 })
    : NextResponse.next()

  // Добавляем CORS заголовки
  response.headers.set('Access-Control-Allow-Origin', origin || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  response.headers.set('Access-Control-Max-Age', '86400') // 24 часа

  return response
}

// Указываем, для каких путей применять middleware
export const config = {
  matcher: ['/api/:path*'],
} 