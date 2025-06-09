import { ApolloServer } from '@apollo/server'
import { NextRequest, NextResponse } from 'next/server'
import { typeDefs } from '../../../lib/graphql/typeDefs'
import { resolvers } from '../../../lib/graphql/resolvers'
import { extractTokenFromHeaders, getUserFromToken } from '../../../lib/auth'
import { prisma } from '../../../lib/prisma'

// Используем глобальную переменную для хранения сервера в режиме разработки
declare global {
  // eslint-disable-next-line no-var
  var __apolloServer: ApolloServer | undefined
}

// Функция для создания контекста
async function createContext(headers: Headers) {
  const token = extractTokenFromHeaders(headers)
  
  if (!token) {
    return { headers }
  }

  // Проверяем, является ли токен JWT (пользователь) или простым токеном (клиент)
  if (token.startsWith('client_')) {
    // Это токен клиента
    const parts = token.split('_')
    console.log('GraphQL Route: обработка токена клиента:', token, 'parts:', parts)
    if (parts.length >= 2) {
      const clientId = parts[1]
      try {
        const client = await prisma.client.findUnique({
          where: { id: clientId }
        })
        console.log('GraphQL Route: найден клиент:', client ? client.id : 'null')
        if (client) {
          return {
            clientId: client.id,
            userRole: 'CLIENT',
            userEmail: client.email,
            headers
          }
        }
      } catch (error) {
        console.error('Ошибка получения клиента по токену:', error)
      }
    }
  } else {
    // Это JWT токен пользователя
    const payload = getUserFromToken(token)
    if (payload) {
      return {
        userId: payload.userId,
        userRole: payload.role,
        userEmail: payload.email,
        headers
      }
    }
  }

  return { headers }
}

// Создаем или получаем существующий сервер
const getServer = () => {
  if (global.__apolloServer) {
    return global.__apolloServer
  }

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  // В режиме разработки сохраняем сервер глобально
  if (process.env.NODE_ENV === 'development') {
    global.__apolloServer = server
  }

  return server
}

const server = getServer()

// Функция для безопасного запуска сервера
const ensureServerStarted = async () => {
  try {
    // Проверяем, запущен ли уже сервер
    const serverState = (server as unknown as { state?: { phase?: string } }).state
    if (!serverState || serverState.phase === 'stopped') {
      await server.start()
    }
  } catch (error: unknown) {
    // Если сервер уже запущен, игнорируем ошибку
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (!errorMessage.includes('start()')) {
      throw error
    }
  }
}

// CORS заголовки
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Обработчик OPTIONS для CORS
async function handleOptions() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  })
}

// Создаем простой обработчик для Next.js
async function handler(req: NextRequest) {
  try {
    // Обрабатываем OPTIONS запрос для CORS
    if (req.method === 'OPTIONS') {
      return handleOptions()
    }

    await ensureServerStarted()
    
    if (req.method === 'POST') {
      const body = await req.json()
      
      // Создаем контекст для каждого запроса
      const requestContext = await createContext(req.headers)
      
      // Добавляем контекст в глобальную переменную для доступа в резолверах
      ;(global as unknown as { __graphqlContext: unknown }).__graphqlContext = requestContext
      
      const result = await server.executeOperation({
        query: body.query,
        variables: body.variables,
        operationName: body.operationName,
      })
      
      // Возвращаем только данные, без обертки Apollo Server
      if (result.body.kind === 'single') {
        return Response.json(result.body.singleResult, {
          headers: corsHeaders
        })
      }
      
      return Response.json(result, {
        headers: corsHeaders
      })
    }
    
    // Для GET запросов возвращаем GraphQL Playground
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GraphQL Playground</title>
        </head>
        <body>
          <div id="root">
            <style>
              body { margin: 0; font-family: Arial, sans-serif; }
              #root { height: 100vh; display: flex; align-items: center; justify-content: center; }
            </style>
            <h1>GraphQL API готов!</h1>
            <p>Отправляйте POST запросы на /api/graphql</p>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('GraphQL Server Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

export { handler as GET, handler as POST, handler as OPTIONS } 